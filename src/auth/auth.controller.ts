import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/common/entity/user.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/sign-up')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Public()
  @HttpCode(200)
  @Post('/sign-in')
  async signIn(@Body() credentials: { username: string; password: string }) {
    return this.authService.signIn(credentials);
  }

  @Get('/get-user')
  async getUser(@Req() request: Request) {
    return request['user'];
  }
}
