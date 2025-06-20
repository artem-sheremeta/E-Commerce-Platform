import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'HardSecret',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id || payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
