import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './room.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createRoomDto, author) {
    const room = new RoomEntity();
    Object.assign(room, { ...createRoomDto, users: [] });

    const user = await this.userRepository.findOne(
      { id: author.id },
      {
        relations: ['rooms'],
      },
    );

    if (!user) {
      throw new HttpException('Author not exist', HttpStatus.BAD_REQUEST);
    }

    user.rooms.push(room);
    room.users.push(user);
    await this.userRepository.save(user);
    await this.roomRepository.save(room);
    delete room.users;

    return room;
  }

  async findOne(id: number) {
    return this.roomRepository.findOne(id, {
      relations: ['users'],
    });
  }

  async getRoomsForUsers(userId: number) {
    // const user = await this.userRepository.findOne(userId);
    //
    // if (!user) {
    //   throw new HttpException('No access', HttpStatus.UNPROCESSABLE_ENTITY);
    // }

    return this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updatedAt', 'DESC');
    // .getMany();
  }
}
