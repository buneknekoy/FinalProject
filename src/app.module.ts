import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from './entities';
import { ApiController } from './api.controller';
import { AuthController, AuthService, JwtAuthGuard } from './auth';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: (env) => { if (!env.JWT_SECRET || env.JWT_SECRET.startsWith('replace-') || env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be replaced with a random secret of at least 32 characters.'); return env; } }), ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (c: ConfigService) => ({
      type: 'mysql' as const, host: c.getOrThrow<string>('DB_HOST'), port: Number(c.get('DB_PORT', 3306)), username: c.getOrThrow<string>('DB_USER'),
      password: c.get<string>('DB_PASSWORD'), database: c.getOrThrow<string>('DB_NAME'), entities: ENTITIES, synchronize: false,
      timezone: 'Z', charset: 'utf8mb4', autoLoadEntities: true,
    }) }),
    TypeOrmModule.forFeature(ENTITIES),
    JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (c: ConfigService) => ({
      secret: c.getOrThrow('JWT_SECRET'), signOptions: { expiresIn: c.get('JWT_EXPIRES_IN', '1h') },
    }) }),
  ],
  controllers: [AuthController, ApiController], providers: [AuthService, JwtAuthGuard, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
