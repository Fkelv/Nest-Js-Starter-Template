import { BullModule } from '@nestjs/bull';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';

const user = new User();
user.isEmailVerified = false;

describe('EmailService', () => {
  let service: EmailService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let emailService: EmailService;
  let configService: ConfigService;
  const email = 'example@ex.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'email',
        }),
      ],
      providers: [
        UsersService,
        {
          provide: UsersService,
          useValue: {
            getByEmail: jest.fn().mockResolvedValue(user),
            markEmailAsConfirmed: jest.fn().mockResolvedValue(true),
            getById: jest.fn().mockResolvedValue(user),
          },
        },
        EmailService,
        JwtService,
        ConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    usersService = module.get<UsersService>(UsersService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmEmail', () => {
    it("should return 'User has been verified' if email wasn't verified yet", () => {
      expect(service.confirmEmail(email)).resolves.toEqual({
        message: 'User has been verified.',
      });
      expect(usersService.getByEmail).toHaveBeenCalledWith(email);
    });

    it("should throw exception if user's email is already confirmed", () => {
      user.isEmailVerified = true;
      expect(service.confirmEmail(email)).rejects.toThrow(BadRequestException);
      expect(service.confirmEmail(email)).rejects.toThrowError(
        `${email} is already confirmed`,
      );
    });

    it('should throw an exception if email verification fails', () => {
      user.isEmailVerified = false;
      jest.spyOn(usersService, 'markEmailAsConfirmed').mockResolvedValue(false);
      expect(service.confirmEmail(email)).rejects.toThrow(BadRequestException);
      expect(service.confirmEmail(email)).rejects.toThrowError(/Opps!/);
    });
  });

  describe('decodeConfirmationToken', () => {
    it('should throw an exception if confirmation token is invalid', () => {
      expect(
        emailService.decodeConfirmationToken('invalidToken'),
      ).rejects.toThrow(BadRequestException);
      expect(
        emailService.decodeConfirmationToken('invalidToken'),
      ).rejects.toThrowError('Bad confirmation token');
    });

    it('should throw exception if confirmation token is already expired', () => {
      const token = jwtService.sign(
        { email },
        {
          secret: 'secret',
          expiresIn: '0.001',
        },
      );
      expect(service.decodeConfirmationToken(token)).rejects.toThrowError(
        'Email confirmation token expired',
      );
    });

    it('should throw exception if confirmation token is already expired', () => {
      const token = jwtService.sign(
        { email },
        {
          secret: 'secret',
          expiresIn: '5000',
        },
      );
      expect(service.decodeConfirmationToken(token)).resolves.toBe(email);
    });
  });

  describe('resendConfirmationLink', () => {
    it('should send a new confirmation email', async () => {
      const spy = jest.spyOn(service, 'sendConfirmation');
      await service.resendConfirmationLink(1);
      expect(spy).toHaveBeenCalledWith(user);
    });

    it('should throw an exception if email is already verified', () => {
      user.isEmailVerified = true;
      expect(service.resendConfirmationLink(1)).rejects.toThrowError(
        'Email already confirmed',
      );
    });

    it('should throw an exception if user does not exist', () => {
      jest.spyOn(usersService, 'getById').mockResolvedValue(undefined);
      expect(service.resendConfirmationLink(1)).rejects.toThrowError(
        'User not found',
      );
    });
  });
});
