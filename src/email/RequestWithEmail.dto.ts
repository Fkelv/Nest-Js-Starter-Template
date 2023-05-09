import { IsEmail, IsNotEmpty } from 'class-validator';
class RequestWithEmail {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export default RequestWithEmail;
