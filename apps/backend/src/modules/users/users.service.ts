import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getById(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }

  getByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }
}
