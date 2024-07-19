import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  lastName: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  bio: string;
}
