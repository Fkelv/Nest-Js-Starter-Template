import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto, PasswordsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { passwordsMatch } from '../../utilities/vaidation';
import { Public } from '../../utilities/helperFunctions';
import { EmailService } from '../email/email.service';
import RequestToken from './requestToken.dto';
import { PageOptionsDto } from 'src/pagination/page-options.dto';
import { PageDto } from 'src/pagination/page.dto';
import { User } from './entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../auth/guards/role.enum';

@Controller('users')
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Public()
  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    passwordsMatch(createUserDto.password, createUserDto.confirmPassword);
    const { password, ...rest } = await this.usersService.create(createUserDto);
    // await this.emailService.sendConfirmation(user);
    return rest;
  }

  @Roles(Role.Admin)
  @Get('fetch-users')
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Partial<User>>> {
    return this.usersService.findAll(pageOptionsDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Public()
  @Post('token-validation')
  async validateToken(@Body() request: RequestToken) {
    const email = await this.emailService.decodeConfirmationToken(
      request.token,
    );
    return { email };
  }

  @Public()
  @Put('reset-password')
  async resetPassword(@Body() passwordsDto: PasswordsDto) {
    await this.usersService.updatePassword(passwordsDto);
  }
}
