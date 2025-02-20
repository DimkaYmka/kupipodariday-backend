import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { ILike } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (user) {
      throw new UnauthorizedException({
        message: 'Пользователь с таким email или username уже зарегистрирован',
      });
    }
    const { password } = createUserDto;
    const hash = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.save({
      ...createUserDto,
      password: hash,
    });
    delete newUser.password;
    return newUser;
  }

  getCurrentUser(userId: number) {
    return this.userRepository.findOne({
      select: {
        id: true,
        username: true,
        about: true,
        avatar: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id: userId,
      },
    });
  }

  async updateUser(updateUserDto: UpdateUserDto, userId: number) {
    const userToUpdate = await this.userRepository.findOneBy({
      id: userId,
    });
    for (const key in updateUserDto) {
      if (key === 'password') {
        const hash = await bcrypt.hash(updateUserDto[key], 10);
        userToUpdate[key] = hash;
      } else {
        userToUpdate[key] = updateUserDto[key];
      }
    }
    const user = await this.userRepository.save(userToUpdate);
    delete user.password;
    return user;
  }

  async getCurrentUserWishes(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        wishes: true,
      },
    });
    return user.wishes;
  }

  async getUserByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    return user;
  }

  async getWishesByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
      relations: {
        wishes: true,
        offers: true,
      },
    });
    if (!user)
      throw new BadRequestException('Пользователь с таким username не найден');
    return user.wishes;
  }

  async findManyUsers(query: string) {
    return await this.userRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      select: {
        id: true,
        username: true,
        about: true,
        avatar: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    return user;
  }
}
