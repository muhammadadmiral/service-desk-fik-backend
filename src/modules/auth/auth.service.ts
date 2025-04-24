// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      return null;
    }
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nim: user.nim,
        role: user.role,
        department: user.department,
      },
    };
  }

  async loginWithNim(nim: string, password: string) {
    try {
      // Cari user berdasarkan NIM
      const user = await this.usersService.findByNim(nim);

      if (!user) {
        throw new UnauthorizedException('Invalid NIM');
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      // Buat token JWT
      const payload = { sub: user.id, email: user.email, role: user.role };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nim: user.nim,
          role: user.role,
          department: user.department,
        },
      };
    } catch (error) {
      this.logger.error(`Login with NIM failed: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(userData: any) {
    // Hash password sebelum menyimpan ke database
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Buat user baru
    const newUser = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    // Hapus password dari respons
    const { password, ...result } = newUser;

    return result;
  }
}
