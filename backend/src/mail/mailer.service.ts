import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { appConfig } from 'src/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: appConfig.mail.host,
      port: appConfig.mail.port,
      secure: appConfig.mail.port === 465,
      auth:
        appConfig.mail.user && appConfig.mail.pass
          ? { user: appConfig.mail.user, pass: appConfig.mail.pass }
          : undefined,
    });
  }

  async sendInvitationEmail(to: string, role: string): Promise<void> {
    const loginUrl = `${appConfig.app.frontendUrl}/login`;

    const templatePath = path.join(__dirname, 'templates', 'invitation.html');
    let html = fs.readFileSync(templatePath, 'utf-8');
    html = html.replace(/{{role}}/g, role);
    html = html.replace(/{{loginUrl}}/g, loginUrl);

    const text = [
      'Welcome to Oppi!',
      '',
      `You have been invited to join Oppi as a ${role}.`,
      '',
      `To get started, please log in using your Google account: ${loginUrl}`,
      '',
      'If you did not expect this invitation, you can safely ignore this email.',
    ].join('\n');

    try {
      await this.transporter.sendMail({
        from: appConfig.mail.from,
        to,
        subject: 'You have been invited to Oppi',
        text,
        html,
      });
      this.logger.log(`Invitation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${to}`, (error as Error).stack);
      throw error;
    }
  }
}
