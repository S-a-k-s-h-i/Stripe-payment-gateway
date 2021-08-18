import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.stategy';
import { LocalStrategy } from './strategies/local/local.strategy';

@Module({
  imports:[
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_AUTH_SECRET,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,LocalStrategy]
})
export class AuthModule {}
