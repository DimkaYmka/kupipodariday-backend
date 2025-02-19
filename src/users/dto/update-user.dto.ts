import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(2, 30)
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  about: string;

  @IsUrl()
  @IsOptional()
  avatar: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @MinLength(4)
  @IsOptional()
  password: string;
}
