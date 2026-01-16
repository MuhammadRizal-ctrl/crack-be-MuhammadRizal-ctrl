import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    
    if (!clientID || !clientSecret) {
      throw new Error('GitHub OAuth credentials not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || '/api/v1/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, displayName, photos, emails } = profile;
    const user = {
      oauthId: id.toString(),
      oauthProvider: 'github',
      email: emails?.[0]?.value || `${username}@users.noreply.github.com`,
      fullName: displayName || username,
      avatar: photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}

