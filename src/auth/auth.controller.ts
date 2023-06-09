import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';

import { Public } from 'utilities/helperFunctions';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Role } from './guards/role.enum';
import { Roles } from './guards/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth('JWT')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // @Public()
  @Roles(Role.Admin)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
