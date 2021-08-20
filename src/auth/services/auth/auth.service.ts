import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../user/services/user/user.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
    ) {}

    /**
     * Method to validate user with username and password
     * @param name name
     * @param pass password
     * @returns any
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByName(username);
        if (user && bcrypt.compareSync(pass, user.password)) {
            return user;
        }
        return null;
    }

    async login(user: User): Promise<any> {
        const payload = { name: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
