import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, PasswordsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { PageMetaDto } from 'src/pagination/page-meta.dto';
import { PageOptionsDto } from 'src/pagination/page-options.dto';
import { PageDto } from 'src/pagination/page.dto';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserView } from './entities/usersView.entity';

const saltRounds = 10;

@Injectable()
export class UsersService {
  UserView;
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(User) private usersViewRepository: Repository<UserView>,

    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(user);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Partial<User>>> {
    const queryBuilder = await this.usersViewRepository.createQueryBuilder(
      'user_view',
    );
    queryBuilder.select([
      `user_view.id as id`,
      `user_view.email as email`,
      `user_view.firstName as firstName`,
      `user_view.secondName as secondName`,
      `user_view.username as username`,
      `user_view.isActive as isActive`,
      `user_view.roles as roles`,
      `user_view.isEmailVerified as isEmailVerified`,
      `user_view.createdAt as createdAt`,
    ]);
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageRoute = `users/fetch-users?`;

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageRoute,
      pageOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ username });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneByOrFail({
      id,
    });
    const toSaveUser = this.usersRepository.create({
      ...user,
      ...updateUserDto,
    });
    return await this.usersRepository.save(toSaveUser);
  }

  async remove(id: number) {
    return await this.usersRepository.delete({ id });
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
