import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
  ) {}

  async create(room, author) {
    const newRoom: any = this.addAuthorToRoom(room, author);
    return await this.roomRepository.save(newRoom);
  }

  async findOne(id: number) {
    return this.roomRepository.findOne(id, {
      relations: ['users'],
    });
  }

  async getRoomsForUsers(userId: number) {
    return this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updatedAt', 'DESC');
  }

  async addAuthorToRoom(room, author) {
    room.users.push(author);
    return room;
  }
}
