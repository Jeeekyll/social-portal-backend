import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  readonly bio: string;

  @IsNotEmpty()
  readonly username: string;

  readonly image: string;
}
