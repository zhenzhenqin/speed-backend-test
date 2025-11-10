import { Module, forwardRef } from '@nestjs/common'; // 新增 forwardRef 导入
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: 'speed_jwt_secret_key' }),
    // 修复：用 forwardRef 包装 UserModule，解决循环依赖
    forwardRef(() => UserModule),
  ],
  providers: [JwtStrategy, RolesGuard],
  exports: [RolesGuard],
})
export class AuthModule {}