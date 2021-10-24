import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  readonly body: string;

  @IsNotEmpty()
  readonly author: string;
}
