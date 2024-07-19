import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase/supabase.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('/my-profile')
  async findMySelf(@Req() req: Request) {
    return await this.userService.findMyself(req);
  }

  @Patch('/:id')
  async updateUser(
    @Req() req: Request,
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, updateUserDto);
  }

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.userService.uploadImage(file, req);
  }
}
