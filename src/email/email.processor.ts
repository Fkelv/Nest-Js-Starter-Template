import { MailerService } from '@nestjs-modules/mailer';
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { JwtService } from '@nestjs/jwt';
import VerificationTokenPayload from './verificationTokenPayload.dto';
import { ConfigService } from '@nestjs/config';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Process('send-email-confirmation')
  async handleSendEmailConfirmation(job: Job) {
    const { email: to, firstName: name } = job.data;
    const payload: VerificationTokenPayload = { email: to };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      ),
    });
    const url = `${this.configService.get('EMAIL_CONFIRMATION_URL')}/${token}`;

    await this.mailerService.sendMail({
      to,
      subject: `Welcome to ${this.configService.get(
        'APP_NAME',
      )}! Confirm your Email`,
      template: './confirmation',
      context: {
        name,
        url,
      },
    });
  }

  @Process('send-password-reset-email')
  async handlePasswordReset(job: Job) {
    const { email: to, firstName: name } = job.data;
    const payload: VerificationTokenPayload = { email: to };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      ),
    });
    const url = `${this.configService.get('PASSWORD_RESET_URL')}/${token}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Reset Your Password',
      template: './resetPassword',
      context: {
        name,
        url,
      },
    });
  }
}
