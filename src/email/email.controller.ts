import {
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
  Param,
  Post,
  Req,
  Body,
} from '@nestjs/common';
import ConfirmEmailDto from './confirmEmail.dto';
import { EmailService } from './email.service';
import RequestWithUser from './requestWithUser.dto';
import RequestWithEmail from './RequestWithEmail.dto';
import { Public } from '../../utilities/helperFunctions';

@Controller('email')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Get('confirm/:token')
  async confirm(@Param() confirmationData: ConfirmEmailDto) {
    const email = await this.emailService.decodeConfirmationToken(
      confirmationData.token,
    );
    return await this.emailService.confirmEmail(email);
  }

  @Public()
  @Post('resend-confirmation-link')
  async resendConfirmationLink(@Req() request: RequestWithUser) {
    await this.emailService.resendConfirmationLink(request.userId);
  }

  @Public()
  @Post('forgot-password-link')
  async sendPasswordRestLink(@Body() request: RequestWithEmail) {
    await this.emailService.sendEmailPasswordResetLink(request.email);
  }
}
