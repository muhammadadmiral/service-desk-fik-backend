// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UniversityApiService } from '../university-api/university-api.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly universityApiService: UniversityApiService,
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

  // Enhanced loginWithNim method in auth.service.ts
async loginWithNim(nim: string, password: string) {
  try {
    // First try to authenticate with the university API
    const studentInfo = await this.universityApiService.authenticateStudent(nim, password);
    
    if (!studentInfo) {
      throw new UnauthorizedException('Invalid NIM or password');
    }

    // Check if the student already exists in our database
    let user = await this.usersService.findByNim(nim);

    // If the user doesn't exist, create a new one
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await this.usersService.create({
        nim: studentInfo.nim,
        name: studentInfo.nama,
        email: studentInfo.email,
        password: hashedPassword,
        role: 'mahasiswa',
        department: studentInfo.nama_program_studi,
        programStudi: studentInfo.nama_program_studi,
        fakultas: studentInfo.nama_fakultas,
        angkatan: studentInfo.angkatan,
        status: studentInfo.status,
      });
    }

    // Create JWT token
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
