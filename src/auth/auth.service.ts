import {
  Body,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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
      throw new ConflictException(err);
    }
  }

  async signIn(
    @Body() credentials: { username: string; password: string },
  ): Promise<{ access_token: string; user: User }> {
    const user = await this.usersRepository.findOne({
      where: { username: credentials.username },
    });
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }
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
  }
}
