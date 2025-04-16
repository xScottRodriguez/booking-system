import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { users } from '@prisma/client';
import { envs } from '@root/src/common/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt.interface';
import { UserRepository } from '../repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authModel: UserRepository) {
    super({
      secretOrKey: envs.jwtSecret,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<users> {
    const { email } = payload;
    const user = await this.authModel.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    return user;
  }
}
