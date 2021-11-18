// import { Controller, Get, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '../user/guards/auth.guard';
// import { User } from '../user/decorators/user.decorator';
// import { RoomService } from './room.service';
//
// @Controller('rooms')
// export class RoomController {
//   constructor(private readonly roomService: RoomService) {}
//
//   @Get()
//   @UseGuards(AuthGuard)
//   async findAllUsers(@User('id') userId: number) {
//     const rooms = await this.roomService.getRoomsForUsers(userId);
//     return { data: rooms };
//   }
// }
