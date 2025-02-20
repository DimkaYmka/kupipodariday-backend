import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { User } from '../users/entities/user.entity';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const wish = await this.validate(createWishDto);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('Пользователь не найден');
    wish.owner = user;
    return this.wishRepository.save(wish);
  }

  private async validate(createWishDto: CreateWishDto): Promise<Wish> {
    const wish = new Wish();
    for (const key in createWishDto) {
      wish[key] = createWishDto[key];
    }
    const errors = await validate(wish, { whitelist: true });
    if (errors.length > 0) {
      throw new BadRequestException('Ошибка валидации');
    }
    return wish;
  }

  getLastWishes(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: {
        createdAt: 'DESC',
      },
      skip: 0,
      take: 40,
    });
  }

  getTopWishes(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: {
        copied: 'DESC',
      },
      skip: 0,
      take: 20,
    });
  }

  async getOneWish(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      relations: {
        offers: {
          user: true,
        },
        owner: true,
      },
      where: {
        id,
      },
    });
    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');
    return wish;
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      relations: {
        offers: true,
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });

    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');

    if (!wish.offers.length) {
      for (const key in updateWishDto) {
        wish[key] = updateWishDto[key];
      }
      return this.wishRepository.save(wish);
    }
    return wish;
  }

  async remove(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });
    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');
    return await this.wishRepository.remove(wish);
  }

  async copy(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishRepository.findOneBy({ id });
    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');

    const user = await this.userRepository.findOne({
      relations: { wishes: true },
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('Пользователь не найден');

    const isWishHas = user.wishes.some((item) => item.id === wish.id);
    if (isWishHas) {
      throw new BadRequestException('У пользователя уже есть это желание');
    }

    const newWish = this.wishRepository.create({
      ...wish,
      id: undefined,
      copied: 0,
      raised: 0,
      owner: user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    wish.copied = (wish.copied || 0) + 1;

    await this.wishRepository.manager.transaction(async (manager) => {
      await manager.save(wish);
      await manager.save(newWish);
    });

    return this.wishRepository.findOne({
      where: { id: newWish.id },
      relations: { owner: true },
    });
  }
}