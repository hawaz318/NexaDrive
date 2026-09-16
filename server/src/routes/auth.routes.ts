import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, Google/GitHub OAuth (Authorization Code Flow), and password management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, username, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Morgan
 *               email:
 *                 type: string
 *                 example: alex@nexadrive.com
 *               username:
 *                 type: string
 *                 example: alex_morgan
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: User created and tokens issued
 *       400:
 *         description: Validation error or email/username already taken
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: alex@nexadrive.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Authenticated successfully
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Redirect to Google OAuth consent screen
 *     description: |
 *       Redirects the browser to Google's login page. After the user authorizes,
 *       Google redirects back to `/api/v1/auth/google/callback` with a code.
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google consent page
 */
router.get('/google', AuthController.googleRedirect);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: |
 *       Google redirects here after authorization. The server exchanges the code
 *       for user profile info, finds or creates the NexaDrive account, issues JWT tokens,
 *       and redirects the browser to `CLIENT_URL/auth/callback?accessToken=...&refreshToken=...`
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to client app with tokens
 */
router.get('/google/callback', AuthController.googleCallback);

/**
 * @swagger
 * /api/v1/auth/github:
 *   get:
 *     summary: Redirect to GitHub OAuth consent screen
 *     description: |
 *       Redirects the browser to GitHub's login page. After the user authorizes,
 *       GitHub redirects back to `/api/v1/auth/github/callback` with a code.
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to GitHub consent page
 */
router.get('/github', AuthController.githubRedirect);

/**
 * @swagger
 * /api/v1/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     description: |
 *       GitHub redirects here after authorization. The server exchanges the code
 *       for user profile info, finds or creates the NexaDrive account, issues JWT tokens,
 *       and redirects the browser to `CLIENT_URL/auth/callback?accessToken=...&refreshToken=...`
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to client app with tokens
 */
router.get('/github/callback', AuthController.githubCallback);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token issued
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', AuthController.logout);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post('/change-password', authenticateUser, AuthController.changePassword);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link generated
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset completed
 */
router.post('/reset-password', AuthController.resetPassword);

export default router;
