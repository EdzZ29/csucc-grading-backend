import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract token from Cookie
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // 2. Verify Token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'secret', // ⚠️ Ensure this matches your AuthModule secret
      });

      // 3.  Assign Payload to Request
      // This makes req.user.empid available in  controllers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies['jwt']; // Reads the 'jwt' cookie
  }
}
