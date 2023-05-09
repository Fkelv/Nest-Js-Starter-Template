import { IsString, IsNotEmpty } from 'class-validator';
class RequestToken {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export default RequestToken;
