import { IsEmail, IsNotEmpty } from 'class-validator';

class VerificationTokenDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export default VerificationTokenDto;
