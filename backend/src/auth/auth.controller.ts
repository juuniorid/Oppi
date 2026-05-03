import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthProfile, AuthService } from './auth.service';
import { User } from 'database/schema';
import { appConfig } from 'src/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

function clearAuthCookie(res: Response, cookieDomain?: string): void {
  res.clearCookie('jwt', { path: '/' });
  if (cookieDomain) {
    res.clearCookie('jwt', { domain: cookieDomain, path: '/' });
  }
}

function setAuthCookie(res: Response, token: string): void {
  const isProduction = appConfig.app.nodeEnv === 'production';
  const cookieDomain = resolveCookieDomain();

  clearAuthCookie(res, cookieDomain);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(cookieDomain && { domain: cookieDomain }),
  });
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
    setAuthCookie(res, token);

    res.redirect(`${appConfig.app.frontendUrl}/dashboard`);
  }

  @ApiOperation({ summary: 'Refresh the session cookie token' })
  @ApiCookieAuth()
  @Get('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const currentToken = req.cookies?.jwt;
    if (!currentToken) {
      throw new UnauthorizedException('Missing auth token');
    }

    const user = await this.authService.validateRefreshToken(currentToken);
    const token = await this.authService.login(user);
    setAuthCookie(res, token);
    return { success: true };
  }

  @ApiOperation({ summary: 'Logs out the user and clears the session cookie' })
  @ApiCookieAuth()
  @Get('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ success: true; message: string }> {
    const cookieDomain = resolveCookieDomain();

    clearAuthCookie(res, cookieDomain);
    return { success: true, message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Returns the current authenticated user profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthProfile> {
    const token = await this.authService.login(req.user as User);
    setAuthCookie(res, token);
    return this.authService.getProfile(req.user as User);
  }

  @ApiOperation({ summary: 'Updates current authenticated user profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User profile updated' })
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: Request,
    @Body() payload: UpdateProfileDto
  ): Promise<AuthProfile> {
    return this.authService.updateProfile(req.user as User, payload);
  }
}
