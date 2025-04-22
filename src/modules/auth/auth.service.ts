import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async validateToken(token: string) {
    try {
      // Verify the Firebase token
      const decodedToken = await this.firebaseService.verifyToken(token);

      try {
        // Try to find the user in our database
        let user = await this.usersService.findByUid(decodedToken.uid);

        // If user doesn't exist in our database, create one
        if (!user) {
          this.logger.log(
            `User with UID ${decodedToken.uid} not found in database, creating...`,
          );

          try {
            // Try to create a new user
            user = await this.usersService.create({
              uid: decodedToken.uid,
              name:
                decodedToken.name ||
                decodedToken.email?.split('@')[0] ||
                'User',
              email: decodedToken.email || '',
              department: '',
              role: this.determineUserRole(decodedToken.email || ''),
            });

            this.logger.log(`User created with ID: ${user.id}`);
          } catch (createError) {
            this.logger.error(`Failed to create user: ${createError.message}`);

            // If we can't create a user, still return the decoded token
            // This allows the request to proceed with limited functionality
            return {
              ...decodedToken,
              dbUser: null,
              error: 'User could not be created in database',
            };
          }
        }

        // Attach db user to decoded token
        return { ...decodedToken, dbUser: user };
      } catch (dbError) {
        this.logger.error(`Database error: ${dbError.message}`);

        // If there's a database error, still return the decoded token
        // This allows the request to proceed with limited functionality
        return {
          ...decodedToken,
          dbUser: null,
          error: 'Database error occurred',
        };
      }
    } catch (tokenError) {
      this.logger.error(`Token validation failed: ${tokenError.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Helper method to determine user role based on email
  private determineUserRole(email: string): string {
    if (email.includes('admin')) {
      return 'admin';
    } else if (email.includes('dosen')) {
      return 'dosen';
    } else {
      return 'mahasiswa';
    }
  }
}
