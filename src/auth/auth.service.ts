import {
  Body,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entity/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    try {
      const salt = await bcrypt.genSalt(10);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
      const newUser = this.usersRepository.create(createUserDto);
      await this.usersRepository.save(newUser);

      return newUser;
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Email | Username already exist');
      }
      throw new ConflictException('There was a conflict');
    }
  }

  async signIn(
    @Body() credentials: { email: string; password: string },
  ): Promise<{ access_token: string; user: User }> {
    try {
      const user = await this.usersRepository.findOneOrFail({
        where: { email: credentials.email },
      });
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user,
      };
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('User not found');
      } else {
        throw new Error('Failed to sign in');
      }
    }
  }
  async updatePassword(updatePasswordDto: UpdatePasswordDto, req: Request) {
    try {
      const { sub } = req['user'];
      const user = await this.usersRepository.findOne({
        where: { id: +sub },
        select: ['id', 'password'],
      });
      const isOldPasswordValid = await bcrypt.compare(
        updatePasswordDto.oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        throw new UnauthorizedException('Invalid old password');
      }

      const isNewPasswordSame = await bcrypt.compare(
        updatePasswordDto.newPassword,
        user.password,
      );
      if (isNewPasswordSame) {
        throw new UnauthorizedException('New password must be different');
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updatePasswordDto.newPassword, salt);
      await this.usersRepository.save(user);
    } catch (err) {
      throw new Error('Failed to update password');
    }
  }
}
