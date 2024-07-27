import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly supabaseService: SupabaseService,
  ) {}

  async findMyself(req: Request) {
    const { sub } = req['user'];
    const user = await this.usersRepository.findOne({
      where: { id: +sub },
      select: [
        'id',
        'bio',
        'email',
        'firstName',
        'lastName',
        'username',
        'imageUrl',
      ],
    });

    user.imageUrl = `${process.env.SUPABASE_BUCKET_URL}${user.imageUrl}`;

    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: +userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      Object.assign(user, updateUserDto);
      await this.usersRepository.save(user);

      return user;
    } catch (err) {
      throw new Error('Failed to update user');
    }
  }

  async uploadImage(file: Express.Multer.File, req: Request) {
    const uploadedImage = await this.supabaseService.uploadFile(
      `userImage/${Date.now()}_${file.originalname}`,
      file,
    );
    const userId = req['user'].sub;
    const user = await this.usersRepository.findOne({
      where: {
        id: +userId,
      },
    });
    Object.assign(user, {
      ...user,
      imageUrl: uploadedImage.fullPath,
    });
    await this.usersRepository.save(user);

    return uploadedImage.fullPath;
  }
}
