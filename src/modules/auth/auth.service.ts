import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async validateToken(token: string) {
    try {
      const decodedToken = await this.firebaseService.verifyToken(token);

      // Check if user exists in our database
      let user = await this.usersService.findByUid(decodedToken.uid);

      // If user doesn't exist in our database, create one
      if (!user) {
        this.logger.log(
          `User with UID ${decodedToken.uid} not found in database, creating...`,
        );

        // Simplified for now - just use decoded token info
        user = await this.usersService.create({
          uid: decodedToken.uid,
          name: decodedToken.name || 'User',
          email: decodedToken.email || '',
          department: '',
          // Properti role akan ditambahkan di usersService
        });

        this.logger.log(`User created with ID: ${user.id}`);
      }

      // Attach db user to decoded token
      return { ...decodedToken, dbUser: user };
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw error;
    }
  }
}
