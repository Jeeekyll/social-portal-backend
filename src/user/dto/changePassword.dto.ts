import { IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @Length(4, 30)
  readonly currentPassword: string;

  @IsNotEmpty()
  readonly newPassword: string;
}
