import { AuthGuard } from '@nestjs/passport';
import {
  Controller,
  Body,
  Get,
  Patch,
  Req,
  Post,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@Req() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  @Patch('me')
  updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.usersService.updateUser(updateUserDto, req.user.id);
  }

  @Get('me/wishes')
  getCurrentUserWishes(@Req() req) {
    return this.usersService.getCurrentUserWishes(req.user.id);
  }

  @Post('find')
  findManyUsers(@Body('query') query: string) {
    return this.usersService.findManyUsers(query);
  }

  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Get(':username/wishes')
  getWishesByUsername(@Param('username') username: string) {
    return this.usersService.getWishesByUsername(username);
  }
}
