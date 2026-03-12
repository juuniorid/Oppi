import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger'; // New imports
import { AuthService } from './auth.service';
import { User } from 'database/schema';
import { appConfig } from 'src/config/app.config';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth') // Grouping in Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request): Promise<void> {}

  @ApiOperation({ summary: 'Google OAuth2 callback (handles redirect and cookie)' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend dashboard on success' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Email not invited' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    const user = req.user as User;
    const token = await this.authService.login(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: appConfig.app.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${appConfig.app.frontendUrl}/dashboard`);
  }

  @ApiOperation({ summary: 'Logs out the user and clears the session cookie' })
  @ApiCookieAuth()
  @Get('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('jwt');
    // Change redirect to JSON message
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  @ApiOperation({ summary: 'Returns the current authenticated user profile' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<User> {
    return req.user as User;
  }
}