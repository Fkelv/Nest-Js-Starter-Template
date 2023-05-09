import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common';

import { Request } from 'express';

import { UsersService } from './users.service';
import { CreateUserDto, PasswordsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { passwordsMatch } from '../../utilities/vaidation';
import { Public } from '../../utilities/helperFunctions';
import { EmailService } from '../email/email.service';
import RequestToken from './requestToken.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Public()
  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const { password, confirmPassword } = createUserDto;
    passwordsMatch(password, confirmPassword);

    const user = await this.usersService.create(createUserDto);
    await this.emailService.sendConfirmation(user);
    return user;
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const y = await this.usersService.create(createUserDto);
    console.log(y);
  }

  @Public()
  @Get('fetch-users')
  async findAll(@Req() req: Request<string>) {
    const builder = await this.usersService.findAll('users');

    const qry: any = req.query.s;

    if (qry) {
      builder.where(
        'lower(users.firstName) LIKE :s OR lower(users.secondName) LIKE :s',
        {
          s: `%${qry.toLowerCase()}%`,
        },
      );
    }

    const sort: any = req.query.sort;

    if (sort) {
      builder.orderBy('users.id', sort.toUpperCase());
    }

    const page: number = parseInt(req.query.page as any) || 1;
    const perPage = 10;
    const total = await builder.getCount();

    builder.skip((page - 1) * perPage).take(perPage);

    return {
      data: await builder.getMany(),
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
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
