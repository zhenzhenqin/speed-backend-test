import { Injectable, UnauthorizedException, forwardRef, Inject } from '@nestjs/common'; // 新增 forwardRef 和 Inject
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 修复：用 @Inject(forwardRef(() => UserService)) 注入
  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'speed_jwt_secret_key',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('token无效或用户不存在');
    }
    return user;
  }
}