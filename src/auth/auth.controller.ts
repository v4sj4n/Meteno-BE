import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/common/entity/user.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';

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
  async signIn(@Body() credentials: { email: string; password: string }) {
    return this.authService.signIn(credentials);
  }

  @Get('/get-user')
  async getUser(@Req() request: Request) {
    return request['user'];
  }

  @Patch('/update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: Request,
  ) {
    await this.authService.updatePassword(updatePasswordDto, req);
  }
}
