import {
  Controller,
  Body,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistsService } from './wishlists.service';

@Controller('wishlistlists')
@UseGuards(AuthGuard('jwt'))
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto, @Req() req) {
    return this.wishlistsService.create(createWishlistDto, req.user.id);
  }

  @Get()
  getAllWishlists() {
    return this.wishlistsService.getAllWishlists();
  }

  @Get(':id')
  getWishListById(@Param('id') id: string) {
    return this.wishlistsService.getWishListById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Req() req,
  ) {
    return this.wishlistsService.update(+id, updateWishlistDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.wishlistsService.remove(+id, req.user.id);
  }
}
