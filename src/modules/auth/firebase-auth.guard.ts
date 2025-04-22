import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private authService: AuthService,
    private usersService: UsersService, // Menambahkan dependency UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('No authorization header provided');
      throw new UnauthorizedException('No token provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      this.logger.warn('Invalid authorization header format');
      throw new UnauthorizedException('Invalid token format');
    }

    const token = parts[1];

    try {
      const decodedToken = await this.authService.validateToken(token);

      // Cek apakah 'name' ada, jika tidak gunakan email atau uid sebagai fallback
      const userName = decodedToken.email || 'Unknown User';

      // Pastikan 'uid' dan 'email' ada di token
      if (!decodedToken.uid || !decodedToken.email) {
        this.logger.warn('Token tidak memiliki UID atau email yang valid');
        throw new UnauthorizedException('Invalid token structure');
      }

      let dbUser = await this.usersService.findByUid(decodedToken.uid);

      if (!dbUser) {
        this.logger.warn(
          `User not found in database, creating new user for UID: ${decodedToken.uid}`,
        );
        dbUser = await this.usersService.create({
          uid: decodedToken.uid,
          name: userName, // Gunakan 'name' jika ada, jika tidak gunakan fallback
          email: decodedToken.email,
        });
      }

      request.user = dbUser;

      return true;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
