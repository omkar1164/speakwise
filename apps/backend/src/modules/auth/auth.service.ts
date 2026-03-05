import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import type { AuthResponseDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await hash(dto.password, 10);
    const user = await this.usersRepository.create({
      email: dto.email,
      password: passwordHash,
      proficiencyLevel: dto.proficiencyLevel,
    });

    return {
      accessToken: await this.signToken({ sub: user.id, email: user.email }),
      user: {
        id: user.id,
        email: user.email,
        proficiencyLevel: user.proficiencyLevel,
        xp: user.xp,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: await this.signToken({ sub: user.id, email: user.email }),
      user: {
        id: user.id,
        email: user.email,
        proficiencyLevel: user.proficiencyLevel,
        xp: user.xp,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    };
  }

  private signToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
