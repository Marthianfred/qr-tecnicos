import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { KeycloakIAMService } from '../../services/iam.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private iamService: KeycloakIAMService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }
    try {
      const user = await this.iamService.validateToken(token);
      request['user'] = user;
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') return token;
    
    // Support for SSE/WebSockets via query param
    return request.query?.token;
  }
}
