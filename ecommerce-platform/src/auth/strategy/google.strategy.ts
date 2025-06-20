// google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  // async validate(
  //   accessToken: string,
  //   refreshToken: string,
  //   profile: any,
  //   done: VerifyCallback,
  // ): Promise<any> {
  //   const { name, emails } = profile;
  //   const user = {
  //     email: emails[0].value,
  //     username: name.givenName,
  //   };
  //   done(null, user);
  // }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const email = emails[0].value;
    const username = name?.givenName || 'GoogleUser';

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.createWithGoogle({
        email,
        username,
        role: 'customer',
      });
    }

    done(null, user);
  }
}
