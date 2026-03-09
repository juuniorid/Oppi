import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from 'database/schema';
import { appConfig } from 'src/config/app.config';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request): Promise<void> {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    const user = req.user as User;
    const token = await this.authService.login(user);
    res.cookie('jwt', token, { httpOnly: true, secure: false }); // secure: true in prod
    res.redirect(`${appConfig.app.frontendUrl}/dashboard`);
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('jwt');
    res.redirect(`${appConfig.app.frontendUrl}/login`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<User> {
    return req.user as User;
  }
}
