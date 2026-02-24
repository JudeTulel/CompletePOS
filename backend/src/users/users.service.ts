import { Injectable } from '@nestjs/common';
import { User, UserRole } from './users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserDto {
    username: string;
    password: string;
    role?: UserRole;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async signup(createUserDto: CreateUserDto): Promise<User> {
        const { username, password, role } = createUserDto;
        const existing = await this.usersRepository.findOne({ where: { username } });
        if (existing) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            username,
            password: hashedPassword,
            role: role || UserRole.CASHIER,
        });
        return this.usersRepository.save(user);
    }

    async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }

    async login(username: string, password: string): Promise<User> {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return user;
    }

    async findAll() {
        return this.usersRepository.find();
    }

    async findById(id: string): Promise<User | undefined> {
        return (await this.usersRepository.findOne({ where: { id } })) ?? undefined;
    }
}