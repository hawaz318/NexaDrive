import { z } from 'zod';

// ─── Self-Service Schemas ─────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .max(500, 'Avatar URL cannot exceed 500 characters')
    .nullable()
    .optional(),
});

export const updateEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required to change email'),
});

export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to deactivate account'),
});

// ─── Admin Schemas ────────────────────────────────────────────────────────────

export const adminUpdateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  storageQuota: z
    .string()
    .regex(/^\d+$/, 'Storage quota must be a numeric string (bytes)')
    .optional(),
});

export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1))
    .optional()
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default(20),
  search: z.string().max(100).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z
    .enum(['createdAt', 'name', 'email', 'username', 'usedStorage'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ─── Activity Log Query Schema ────────────────────────────────────────────────

export const activityQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1))
    .optional()
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default(20),
});

// ─── Exported Types ───────────────────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type DeactivateAccountInput = z.infer<typeof deactivateAccountSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;
