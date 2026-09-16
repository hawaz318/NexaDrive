import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateUser, requireRole } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management (self-service) and admin user operations
 */

// ─── All routes below require authentication ─────────────────────────────────
router.use(authenticateUser);

// ─── Self-Service /me Routes ──────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full user profile with linked OAuth providers
 *       401:
 *         description: Not authenticated
 */
router.get('/me', UserController.getMyProfile);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Morgan Updated
 *               username:
 *                 type: string
 *                 example: alex_new
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error or username already taken
 */
router.patch('/me', UserController.updateMyProfile);

/**
 * @swagger
 * /api/v1/users/me/email:
 *   patch:
 *     summary: Change current user's email address
 *     description: Requires password confirmation. Sets isEmailVerified to false.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newEmail, password]
 *             properties:
 *               newEmail:
 *                 type: string
 *                 example: newemail@nexadrive.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Email updated
 *       400:
 *         description: Email already in use or OAuth-only account
 *       401:
 *         description: Invalid password
 */
router.patch('/me/email', UserController.updateMyEmail);

/**
 * @swagger
 * /api/v1/users/me/storage:
 *   get:
 *     summary: Get storage usage statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage quota, used, available, file/folder counts
 */
router.get('/me/storage', UserController.getMyStorage);

/**
 * @swagger
 * /api/v1/users/me/activity:
 *   get:
 *     summary: Get activity log (paginated)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated activity history
 */
router.get('/me/activity', UserController.getMyActivity);

/**
 * @swagger
 * /api/v1/users/me/providers:
 *   get:
 *     summary: List linked OAuth providers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of linked providers (GOOGLE, GITHUB)
 */
router.get('/me/providers', UserController.getMyLinkedProviders);

/**
 * @swagger
 * /api/v1/users/me/providers/{provider}:
 *   delete:
 *     summary: Unlink an OAuth provider
 *     description: Removes the OAuth link. Blocked if it is the user's only authentication method (no password set and no other providers linked).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [google, github, GOOGLE, GITHUB]
 *     responses:
 *       200:
 *         description: Provider unlinked
 *       400:
 *         description: Cannot unlink sole auth method
 *       404:
 *         description: Provider not linked
 */
router.delete('/me/providers/:provider', UserController.unlinkMyProvider);

/**
 * @swagger
 * /api/v1/users/me/deactivate:
 *   post:
 *     summary: Deactivate own account
 *     description: Requires password confirmation. Deactivates the account and revokes all sessions.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Account deactivated
 *       401:
 *         description: Invalid password
 */
router.post('/me/deactivate', UserController.deactivateMyAccount);

// ─── Admin Routes (ADMIN role required) ───────────────────────────────────────

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or username
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, email, username, usedStorage]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', requireRole('ADMIN'), UserController.listUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full user profile
 *       404:
 *         description: User not found
 */
router.get('/:id', requireRole('ADMIN'), UserController.getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *               isActive:
 *                 type: boolean
 *               storageQuota:
 *                 type: string
 *                 description: Storage quota in bytes (numeric string)
 *                 example: "1099511627776"
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.patch('/:id', requireRole('ADMIN'), UserController.adminUpdateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     description: Hard-deletes the user and all related data via cascade.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/:id', requireRole('ADMIN'), UserController.adminDeleteUser);

export default router;
