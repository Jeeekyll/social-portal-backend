import { IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  readonly name: string;

  readonly description?: string;
}
