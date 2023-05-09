import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto, PasswordsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // create(createUserDto: CreateUserDto) {
  //   const { confirmPassword, ...rest } = createUserDto;

  //   const data = this.usersRepository.create(rest);
  //   console.log(data);

  //   const user = this.usersRepository.save(data);

  //   return user;
  // }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(user);
  }

  async findAll(alias: string) {
    return this.usersRepository.createQueryBuilder(alias);
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ username });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  async getByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async markEmailAsConfirmed(email: string): Promise<boolean> {
    try {
      await this.usersRepository.update(
        { email },
        {
          isEmailVerified: true,
        },
      );
      return true;
    } catch (error) {
      this.logger.debug(error);
      return false;
    }
  }

  async getById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ id });
  }

  async updatePassword(passwordsDto: PasswordsDto) {
    const { email, newPassword: password } = passwordsDto;
    await this.usersRepository.update(
      { email },
      { password: await bcrypt.hash(password, saltRounds) },
    );
  }
}
