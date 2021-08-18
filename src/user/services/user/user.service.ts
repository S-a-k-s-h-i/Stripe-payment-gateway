import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo:Repository<User>
    ){} 

    async createOne(createUserDto: CreateUserDto) {
        const newUser = this.userRepo.create(createUserDto);
        await this.userRepo.save(newUser);
        return newUser;
    }

    async findByName(username: string) {
        return await User.findOne({
            where: {
                username: username,
            },
        });
        }
    
    async findById(id:string):Promise<User>{
        return await this.userRepo.findOne(id);
    }

    async updateOne(data): Promise<User> {
        return await this.userRepo.save(data);
    }
}
