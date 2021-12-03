import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './room.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateRoomDto } from './dto/createRoom.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createRoomDto: CreateRoomDto, userId: number) {
    const room = new RoomEntity();
    Object.assign(room, { ...createRoomDto, users: [] });

    const userById = await this.userRepository.findOne(
      { id: userId },
      {
        relations: ['rooms'],
      },
    );

    if (!userById) {
      throw new HttpException('User not exist', HttpStatus.BAD_REQUEST);
    }

    userById.rooms.push(room);
    room.users.push(userById);
    await this.userRepository.save(userById);
    await this.roomRepository.save(room);
    delete room.users;

    return { data: room };
  }

  async findOne(id: number) {
    return this.roomRepository.findOne(id, {
      relations: ['users'],
    });
  }

  async findAllMessages(roomId: number) {
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.id = :roomId', { roomId })
      .leftJoinAndSelect('room.messages', 'messages')
      .leftJoinAndSelect('messages.user', 'user')
      .getOne();

    if (!room) {
      throw new HttpException('Wrong room id', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return { data: room };
  }

  async findAll() {
    const rooms = await this.roomRepository.find({
      relations: ['users'],
    });
    return { data: rooms };
  }

  async getRoomsForUsers(userId: number) {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new HttpException('No access', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updatedAt', 'DESC')
      .getMany();
  }
}
