import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EmailService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  public async confirmEmail(email: string) {
    const user = await this.usersService.getByEmail(email);
    if (user.isEmailVerified) {
      throw new BadRequestException(`${email} is already confirmed`);
    }
    const emailVerify = await this.usersService.markEmailAsConfirmed(email);
    if (emailVerify) {
      return { message: 'User has been verified.' };
    }
    throw new BadRequestException(
      'Opps! An error occured while verifying email',
    );
  }

  async sendConfirmation(user: User) {
    await this.emailQueue.add('send-email-confirmation', user);
  }
  async sendPasswordResetLink(user: User) {
    await this.emailQueue.add('send-password-reset-email', user);
  }

  public async decodeConfirmationToken(token: string): Promise<string> {
    const secret = this.configService.get('JWT_VERIFICATION_TOKEN_SECRET');
    try {
      const payload = await this.jwtService.verify(token, {
        secret,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  public async resendConfirmationLink(userId: number) {
    const user = await this.usersService.getById(userId);
    if (user) {
      if (user.isEmailVerified) {
        throw new BadRequestException('Email already confirmed');
      }
      return await this.sendConfirmation(user);
    }
    throw new BadRequestException('User not found');
  }

  public async sendEmailPasswordResetLink(email: string) {
    const user = await this.usersService.getByEmail(email);
    if (user && user.isEmailVerified) {
      return await this.sendPasswordResetLink(user);
    }
    throw new BadRequestException(
      "The email you've enter is either unverified or not associated with an account.",
    );
  }
}
