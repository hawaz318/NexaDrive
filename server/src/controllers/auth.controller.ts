import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { config } from '../config/env';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    const result = await AuthService.register(validatedData);
    return sendResponse(res, { statusCode: 201, message: 'User registered successfully', data: result });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData);
    return sendResponse(res, { statusCode: 200, message: 'User logged in successfully', data: result });
  });

  /**
   * Redirect user to Google consent screen
   */
  static googleRedirect = asyncHandler(async (_req: Request, res: Response) => {
    const url = AuthService.getGoogleAuthUrl();
    res.redirect(url);
  });

  /**
   * Handle Google OAuth callback — exchange code, issue JWT, redirect to client
   */
  static googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error || !code) {
      return res.redirect(`${config.clientUrl}/auth/error?message=Google+login+was+cancelled`);
    }

    const result = await AuthService.handleGoogleCallback(code);

    // Redirect to frontend with tokens in query params (client stores them)
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return res.redirect(`${config.clientUrl}/auth/callback?${params.toString()}`);
  });

  /**
   * Redirect user to GitHub consent screen
   */
  static githubRedirect = asyncHandler(async (_req: Request, res: Response) => {
    const url = AuthService.getGithubAuthUrl();
    res.redirect(url);
  });

  /**
   * Handle GitHub OAuth callback — exchange code, issue JWT, redirect to client
   */
  static githubCallback = asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error || !code) {
      return res.redirect(`${config.clientUrl}/auth/error?message=GitHub+login+was+cancelled`);
    }

    const result = await AuthService.handleGithubCallback(code);

    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return res.redirect(`${config.clientUrl}/auth/callback?${params.toString()}`);
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = refreshTokenSchema.parse(req.body);
    const result = await AuthService.refreshToken(validatedData.refreshToken);
    return sendResponse(res, { statusCode: 200, message: 'Tokens refreshed successfully', data: result });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken ?? req.headers['x-refresh-token'];
    await AuthService.logout(refreshToken);
    return sendResponse(res, { statusCode: 200, message: 'Logged out successfully' });
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = changePasswordSchema.parse(req.body);
    await AuthService.changePassword(req.user!.id, validatedData);
    return sendResponse(res, { statusCode: 200, message: 'Password changed successfully. Please log in again' });
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await AuthService.forgotPassword(validatedData.email);
    return sendResponse(res, { statusCode: 200, message: 'Password reset request processed', data: result });
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = resetPasswordSchema.parse(req.body);
    await AuthService.resetPassword(validatedData);
    return sendResponse(res, { statusCode: 200, message: 'Password reset successfully. Please log in with your new password' });
  });
}
