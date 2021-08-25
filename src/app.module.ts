import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from './general/guards/role-authentication.guard';
import { OrderModule } from './order/order.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(),
    // Initialize scheduler to perform task scheduling
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    StripeModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Default middleware guard for all the request
    {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
    },
    // Default middleware guard for role authentication for requests
    {
          provide: APP_GUARD,
          useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
