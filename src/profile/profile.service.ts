import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowEntity } from './follow.entity';
import { getRepository, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ProfileType } from './types/profile.type';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserProfile(username: string, currentUserId: number) {
    const userByUsername = await this.userRepository.findOne({ username });

    if (!userByUsername) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isFollowed = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: userByUsername.id,
    });

    return {
      ...userByUsername,
      following: Boolean(isFollowed),
    };
  }

  async getFollowingUsers(currentUserId: number) {
    const userById = await this.userRepository.findOne({ id: currentUserId });

    if (!userById) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const followingUsers = await this.followRepository.find({
      followerId: currentUserId,
    });

    if (!followingUsers || followingUsers.length === 0) {
      return { users: [] };
    }

    const followingUsersIdx = followingUsers.map((user) => user.followingId);
    const queryBuilder = await getRepository(UserEntity)
      .createQueryBuilder('users')
      .where('users.id in (:...ids)', { ids: followingUsersIdx })
      .getMany();
    return { users: queryBuilder };
  }

  async follow(username: string, currentUserId: number) {
    const userByUsername = await this.userRepository.findOne({ username });

    if (!userByUsername) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === userByUsername.id) {
      throw new HttpException('Cant follow yourself', HttpStatus.BAD_REQUEST);
    }

    const isFollowed = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: userByUsername.id,
    });

    if (!isFollowed) {
      const follow = new FollowEntity();
      follow.followerId = currentUserId;
      follow.followingId = userByUsername.id;
      await this.followRepository.save(follow);
    }

    return {
      ...userByUsername,
      following: true,
    };
  }

  async unfollow(username: string, currentUserId: number) {
    const userByUsername = await this.userRepository.findOne({ username });

    if (!userByUsername) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === userByUsername.id) {
      throw new HttpException('Cant follow yourself', HttpStatus.BAD_REQUEST);
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: userByUsername.id,
    });

    return {
      ...userByUsername,
      following: false,
    };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
}
