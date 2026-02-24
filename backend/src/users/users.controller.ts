import { Controller } from '@nestjs/common';
import { Body, Post, Res, Get } from '@nestjs/common';
import { UsersService, CreateUserDto } from './users.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
        try {
            const user = await this.usersService.signup(createUserDto);
            res.status(201).json({ message: 'User created', user: { id: user.id, username: user.username, role: user.role } });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    @Post('login')
    async login(@Body() body: { username: string; password: string }, @Res() res: Response) {
        try {
            const user = await this.usersService.login(body.username, body.password);
            res.json({ message: 'Logged in', user: { id: user.id, username: user.username, role: user.role } });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    @Post('logout')
    async logout(@Res() res: Response) {
        res.json({ message: 'Logged out' });
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }
}
