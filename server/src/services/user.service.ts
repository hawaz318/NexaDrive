import prisma from '../lib/prisma';
import { comparePassword } from '../utils/password';
import { AppError } from '../middlewares/errorHandler';
import { Role, OAuthAccount, Prisma } from '@prisma/client';
import {
  UpdateProfileInput,
  UpdateEmailInput,
  AdminUpdateUserInput,
  ListUsersQuery,
} from '../validations/user.validation';

// ─── Internal Helpers ─────────────────────────────────────────────────────────

interface UserProfileFields {
  id: string;
  name: string | null;
  email: string;
  username: string;
  role: Role;
  avatar: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  storageQuota: bigint;
  usedStorage: bigint;
  createdAt: Date;
  updatedAt: Date;
}

function formatUserProfile(user: UserProfileFields) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    storageQuota: user.storageQuota.toString(),
    usedStorage: user.usedStorage.toString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

// ─── UserService ──────────────────────────────────────────────────────────────

export class UserService {
  // ─── Self-Service Methods ─────────────────────────────────────────────────

  /**
   * Get the authenticated user's full profile, including linked OAuth providers
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: {
          select: { provider: true, createdAt: true },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    return {
      ...formatUserProfile(user),
      hasPassword: !!user.passwordHash,
      linkedProviders: user.oauthAccounts.map((oa: { provider: string; createdAt: Date }) => ({
        provider: oa.provider,
        linkedAt: oa.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Update profile fields (name, username, avatar)
   */
  static async updateProfile(userId: string, data: UpdateProfileInput) {
    // Validate username uniqueness if changing
    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existing && existing.id !== userId) {
        throw new AppError('Username is already taken', 400);
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await prisma.activity.create({
      data: {
        userId,
        action: 'PROFILE_UPDATE',
        details: JSON.stringify({ updatedFields: Object.keys(data) }),
      },
    });

    return formatUserProfile(user);
  }

  /**
   * Change email address (requires password verification)
   */
  static async updateEmail(userId: string, data: UpdateEmailInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (!user.passwordHash) {
      throw new AppError(
        'Cannot change email for OAuth-only accounts. Please set a password first',
        400
      );
    }

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid password', 401);

    // Check if new email is already in use
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.newEmail },
    });
    if (existingEmail) {
      throw new AppError('Email address is already registered', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: data.newEmail, isEmailVerified: false },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: 'EMAIL_CHANGE',
        details: JSON.stringify({
          oldEmail: user.email,
          newEmail: data.newEmail,
        }),
      },
    });

    return formatUserProfile(updatedUser);
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageQuota: true, usedStorage: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const fileCount = await prisma.file.count({
      where: { ownerId: userId, isTrashed: false },
    });

    const folderCount = await prisma.folder.count({
      where: { ownerId: userId, isTrashed: false },
    });

    const trashedCount = await prisma.file.count({
      where: { ownerId: userId, isTrashed: true },
    });

    const storageQuota = user.storageQuota;
    const usedStorage = user.usedStorage;
    const availableStorage = storageQuota - usedStorage;
    const usagePercent =
      storageQuota > BigInt(0)
        ? Number((usedStorage * BigInt(10000)) / storageQuota) / 100
        : 0;

    return {
      storageQuota: storageQuota.toString(),
      usedStorage: usedStorage.toString(),
      availableStorage: availableStorage.toString(),
      usagePercent: Math.round(usagePercent * 100) / 100,
      fileCount,
      folderCount,
      trashedFileCount: trashedCount,
    };
  }

  /**
   * Get paginated activity log
   */
  static async getActivityLog(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          details: true,
          ipAddress: true,
          createdAt: true,
        },
      }),
      prisma.activity.count({ where: { userId } }),
    ]);

    return {
      activities: activities.map((a: { id: string; action: string; details: string | null; ipAddress: string | null; createdAt: Date }) => ({
        id: a.id,
        action: a.action,
        details: a.details ? JSON.parse(a.details) : null,
        ipAddress: a.ipAddress,
        createdAt: a.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List linked OAuth providers
   */
  static async getLinkedProviders(userId: string) {
    const accounts = await prisma.oAuthAccount.findMany({
      where: { userId },
      select: { id: true, provider: true, providerUserId: true, createdAt: true },
    });

    return accounts.map((a: { id: string; provider: string; providerUserId: string; createdAt: Date }) => ({
      id: a.id,
      provider: a.provider,
      providerUserId: a.providerUserId,
      linkedAt: a.createdAt.toISOString(),
    }));
  }

  /**
   * Unlink an OAuth provider — blocks if it's the sole auth method
   */
  static async unlinkProvider(userId: string, provider: string) {
    const normalizedProvider = provider.toUpperCase();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { oauthAccounts: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const account = user.oauthAccounts.find(
      (oa: OAuthAccount) => oa.provider === normalizedProvider
    );

    if (!account) {
      throw new AppError(`No ${normalizedProvider} account linked`, 404);
    }

    // Prevent unlinking the only auth method
    const hasPassword = !!user.passwordHash;
    const otherProviders = user.oauthAccounts.filter(
      (oa: OAuthAccount) => oa.provider !== normalizedProvider
    );

    if (!hasPassword && otherProviders.length === 0) {
      throw new AppError(
        'Cannot unlink the only authentication method. Please set a password first',
        400
      );
    }

    await prisma.oAuthAccount.delete({ where: { id: account.id } });

    await prisma.activity.create({
      data: {
        userId,
        action: 'OAUTH_UNLINK',
        details: JSON.stringify({ provider: normalizedProvider }),
      },
    });

    return true;
  }

  /**
   * Self-deactivate account (requires password confirmation)
   */
  static async deactivateAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    if (!user.passwordHash) {
      throw new AppError(
        'Cannot deactivate OAuth-only accounts via password. Please contact support',
        400
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid password', 401);

    // Deactivate and revoke all tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      }),
      prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);

    await prisma.activity.create({
      data: {
        userId,
        action: 'ACCOUNT_DEACTIVATE',
        details: JSON.stringify({ deactivatedBy: 'self' }),
      },
    });

    return true;
  }

  // ─── Admin Methods ────────────────────────────────────────────────────────

  /**
   * List all users with pagination, search, filters, and sorting
   */
  static async listUsers(query: ListUsersQuery) {
    const { page, limit, search, role, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          avatar: true,
          isEmailVerified: true,
          isActive: true,
          storageQuota: true,
          usedStorage: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { files: true, folders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u: {
        id: string;
        name: string | null;
        email: string;
        username: string;
        role: Role;
        avatar: string | null;
        isEmailVerified: boolean;
        isActive: boolean;
        storageQuota: bigint;
        usedStorage: bigint;
        createdAt: Date;
        updatedAt: Date;
        _count: { files: number; folders: number };
      }) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        role: u.role,
        avatar: u.avatar,
        isEmailVerified: u.isEmailVerified,
        isActive: u.isActive,
        storageQuota: u.storageQuota.toString(),
        usedStorage: u.usedStorage.toString(),
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        fileCount: u._count.files,
        folderCount: u._count.folders,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: get any user's full profile
   */
  static async getUserById(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        oauthAccounts: {
          select: { provider: true, createdAt: true },
        },
        _count: {
          select: {
            files: true,
            folders: true,
            refreshTokens: true,
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    return {
      ...formatUserProfile(user),
      hasPassword: !!user.passwordHash,
      linkedProviders: user.oauthAccounts.map((oa: { provider: string; createdAt: Date }) => ({
        provider: oa.provider,
        linkedAt: oa.createdAt.toISOString(),
      })),
      counts: {
        files: user._count.files,
        folders: user._count.folders,
        activeSessions: user._count.refreshTokens,
      },
    };
  }

  /**
   * Admin: update user role, active status, or storage quota
   */
  static async adminUpdateUser(
    targetUserId: string,
    data: AdminUpdateUserInput
  ) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) throw new AppError('User not found', 404);

    const updateData: Prisma.UserUpdateInput = {};

    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.storageQuota !== undefined) {
      updateData.storageQuota = BigInt(data.storageQuota);
    }

    // If deactivating, revoke all refresh tokens
    if (data.isActive === false) {
      await prisma.refreshToken.deleteMany({
        where: { userId: targetUserId },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    await prisma.activity.create({
      data: {
        userId: targetUserId,
        action: 'ADMIN_UPDATE',
        details: JSON.stringify({ updatedFields: Object.keys(data) }),
      },
    });

    return formatUserProfile(updatedUser);
  }

  /**
   * Admin: hard-delete a user and cascade all related data
   */
  static async adminDeleteUser(targetUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) throw new AppError('User not found', 404);

    await prisma.user.delete({ where: { id: targetUserId } });

    return true;
  }
}
