import { Body, CanActivate, Controller, ExecutionContext, Injectable, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities';

export class LoginDto { @IsEmail() email: string; @IsString() @MinLength(8) password: string; }
export interface AuthRequest extends Request { user?: { sub: number; role: string; email: string }; }
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Bearer token required.');
    try { req.user = await this.jwt.verifyAsync<{ sub: number; role: string; email: string }>(token); return true; }
    catch { throw new UnauthorizedException('Token is invalid or expired.'); }
  }
}
@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwt: JwtService) {}
  async login(dto: LoginDto) {
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.email = :email', { email: dto.email.toLowerCase() }).getOne();
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password.');
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role, email: user.email });
    return { accessToken, tokenType: 'Bearer', expiresIn: process.env.JWT_EXPIRES_IN || '1h', user: { id: user.id, email: user.email, role: user.role } };
  }
}
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @UseGuards(JwtAuthGuard) @Post('verify') verify() { return { valid: true }; }
}
