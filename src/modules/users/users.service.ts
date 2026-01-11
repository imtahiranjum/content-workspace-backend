import { ConflictException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async findAll() {
    return this.usersRepo.find();
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

  async updateRole(userId: string, role: Role) {
    const user = await this.findById(userId);
    user.role = role;
    return this.usersRepo.save(user);
  }

  async remove(userId: string) {
    const user = await this.findById(userId);
    return this.usersRepo.remove(user);
  }
}
