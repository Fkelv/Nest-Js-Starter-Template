import { IsNumber, IsNotEmpty } from 'class-validator';
class RequestWithUserDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export default RequestWithUserDto;
