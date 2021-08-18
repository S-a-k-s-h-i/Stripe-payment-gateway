import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../user/entities/user.entity'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  // If user role accessing the api is legit then move forward
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user,roles)
    const match = await this.matchRoles(roles, user);

    if (!match) {
      throw new HttpException(
        'UNAUTHORIZED',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }

  /**
   * Method to match user roles to get to the api
   */
  async matchRoles(roles: any[], userDto: User): Promise<boolean> {
    const user = await User.findOne(+userDto.id);
    const roleCheck = [];
    roles.filter((role: string) => {
      switch (role) {
        case 'buyer':
          user.is_buyer === true ? roleCheck.push(user.is_buyer) : null;
          break;
        case 'seller':
          user.is_seller === true ? roleCheck.push(user.is_seller) : null;
      }
    });
    return roleCheck.length > 0 ? true : false;
  }
}
