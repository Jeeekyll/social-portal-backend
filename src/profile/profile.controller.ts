import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '../user/decorators/user.decorator';
import { AuthGuard } from '../user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(AuthGuard)
  async getUserProfile(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ) {
    const profile = await this.profileService.getUserProfile(
      username,
      currentUserId,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async follow(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ) {
    const profile = await this.profileService.follow(username, currentUserId);
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollow(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ) {
    const profile = await this.profileService.unfollow(username, currentUserId);
    return this.profileService.buildProfileResponse(profile);
  }
}
