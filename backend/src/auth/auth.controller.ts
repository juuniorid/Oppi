import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger'; // New imports
import { AuthProfile, AuthService } from './auth.service';
import { User } from 'database/schema';
import { appConfig } from 'src/config';
import { JwtAuthGuard } from './jwt-auth.guard';

function resolveCookieDomain(): string | undefined {
  if (appConfig.app.nodeEnv === 'production' && appConfig.app.cookieDomain) {
    const normalized = appConfig.app.cookieDomain.trim();
    return normalized.startsWith('.') ? normalized : `.${normalized}`;
  }

  if (appConfig.app.nodeEnv !== 'production') {
    return undefined;
  }

  const hostname = new URL(appConfig.app.frontendUrl).hostname;
  return `.${hostname}`;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request): Promise<void> {}

  @ApiOperation({
    summary: 'Google OAuth2 callback (handles redirect and cookie)',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend dashboard on success',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Email not invited' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const user = req.user as User;
    const token = await this.authService.login(user);

    const isProduction = appConfig.app.nodeEnv === 'production';
    const cookieDomain = resolveCookieDomain();

    // Clear legacy variants first so duplicate jwt cookies do not conflict.
    res.clearCookie('jwt', { path: '/' });
    if (cookieDomain) {
      res.clearCookie('jwt', { domain: cookieDomain, path: '/' });
    }

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...(cookieDomain && { domain: cookieDomain }),
    });

    res.redirect(`${appConfig.app.frontendUrl}/dashboard`);
  }

  @ApiOperation({ summary: 'Logs out the user and clears the session cookie' })
  @ApiCookieAuth()
  @Get('logout')
  async logout(@Res() res: Response): Promise<void> {
    const cookieDomain = resolveCookieDomain();

    res.clearCookie('jwt', { path: '/' });
    if (cookieDomain) {
      res.clearCookie('jwt', { domain: cookieDomain, path: '/' });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  @ApiOperation({ summary: 'Returns the current authenticated user profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<AuthProfile> {
    return this.authService.getProfile(req.user as User);
  }
}
