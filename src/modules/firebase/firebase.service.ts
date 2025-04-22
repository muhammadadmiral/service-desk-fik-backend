import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: firebase.app.App;
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const firebaseConfig = this.configService.get('firebase');

      this.firebaseApp = firebase.initializeApp({
        credential: firebase.credential.cert(firebaseConfig),
      });

      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase: ${error.message}`);
      throw error;
    }
  }

  getAuth(): firebase.auth.Auth {
    return this.firebaseApp.auth();
  }

  async verifyToken(token: string): Promise<firebase.auth.DecodedIdToken> {
    try {
      return await this.getAuth().verifyIdToken(token);
    } catch (error) {
      this.logger.error(`Error verifying token: ${error.message}`);
      throw new Error(`Invalid token: ${error.message}`);
    }
  }
}
