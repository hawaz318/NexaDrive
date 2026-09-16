import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import {
  updateProfileSchema,
  updateEmailSchema,
  deactivateAccountSchema,
  adminUpdateUserSchema,
  listUsersQuerySchema,
  activityQuerySchema,
} from '../validations/user.validation';

export class UserController {
  // ─── Self-Service (/me) ─────────────────────────────────────────────────────

  static getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.getProfile(req.user!.id);
    return sendResponse(res, { statusCode: 200, message: 'Profile retrieved', data: result });
  });

  static updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const data = updateProfileSchema.parse(req.body);
    const result = await UserService.updateProfile(req.user!.id, data);
    return sendResponse(res, { statusCode: 200, message: 'Profile updated', data: result });
  });

  static updateMyEmail = asyncHandler(async (req: Request, res: Response) => {
    const data = updateEmailSchema.parse(req.body);
    const result = await UserService.updateEmail(req.user!.id, data);
    return sendResponse(res, { statusCode: 200, message: 'Email updated', data: result });
  });

  static getMyStorage = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.getStorageStats(req.user!.id);
    return sendResponse(res, { statusCode: 200, message: 'Storage stats retrieved', data: result });
  });

  static getMyActivity = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = activityQuerySchema.parse(req.query);
    const result = await UserService.getActivityLog(req.user!.id, page, limit);
    return sendResponse(res, {
      statusCode: 200,
      message: 'Activity log retrieved',
      data: result.activities,
      meta: result.pagination,
    });
  });

  static getMyLinkedProviders = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.getLinkedProviders(req.user!.id);
    return sendResponse(res, { statusCode: 200, message: 'Linked providers retrieved', data: result });
  });

  static unlinkMyProvider = asyncHandler(async (req: Request, res: Response) => {
    const provider = req.params.provider as string;
    await UserService.unlinkProvider(req.user!.id, provider);
    return sendResponse(res, { statusCode: 200, message: `${provider.toUpperCase()} account unlinked` });
  });

  static deactivateMyAccount = asyncHandler(async (req: Request, res: Response) => {
    const data = deactivateAccountSchema.parse(req.body);
    await UserService.deactivateAccount(req.user!.id, data.password);
    return sendResponse(res, { statusCode: 200, message: 'Account deactivated' });
  });

  // ─── Admin ──────────────────────────────────────────────────────────────────

  static listUsers = asyncHandler(async (req: Request, res: Response) => {
    const query = listUsersQuerySchema.parse(req.query);
    const result = await UserService.listUsers(query);
    return sendResponse(res, {
      statusCode: 200,
      message: 'Users retrieved',
      data: result.users,
      meta: result.pagination,
    });
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.getUserById(req.params.id as string);
    return sendResponse(res, { statusCode: 200, message: 'User retrieved', data: result });
  });

  static adminUpdateUser = asyncHandler(async (req: Request, res: Response) => {
    const data = adminUpdateUserSchema.parse(req.body);
    const result = await UserService.adminUpdateUser(req.params.id as string, data);
    return sendResponse(res, { statusCode: 200, message: 'User updated', data: result });
  });

  static adminDeleteUser = asyncHandler(async (req: Request, res: Response) => {
    await UserService.adminDeleteUser(req.params.id as string);
    return sendResponse(res, { statusCode: 200, message: 'User deleted' });
  });
}
