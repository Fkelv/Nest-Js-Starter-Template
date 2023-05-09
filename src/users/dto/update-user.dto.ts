import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  secondName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  password: string;

  @IsNotEmpty()
  role: number;
}
