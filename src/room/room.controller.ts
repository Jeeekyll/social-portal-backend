import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from '../user/decorators/user.decorator';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/createRoom.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return await this.roomService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findAllMessages(@Param('id') roomId: number) {
    return await this.roomService.findAllMessages(roomId);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(@Body() createRoomDto: CreateRoomDto, @User('id') userId) {
    return await this.roomService.create(createRoomDto, userId);
  }

  //
  // @Get()
  // @UseGuards(AuthGuard)
  // async findAllUsers(@User('id') userId: number) {
  //   const rooms = await this.roomService.getRoomsForUsers(userId);
  //   return { data: rooms };
  // }
}
