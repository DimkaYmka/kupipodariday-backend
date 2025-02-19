import { Length, Min, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateWishDto {
  @IsString()
  @IsOptional()
  @Length(1, 250)
  name: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  price: number;

  @IsString()
  @Length(1, 1024)
  @IsOptional()
  description: string;
}
