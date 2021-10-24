import { IsNotEmpty } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty()
  readonly body: string;

  @IsNotEmpty()
  readonly author: string;
}
