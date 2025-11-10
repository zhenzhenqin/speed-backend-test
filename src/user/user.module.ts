import { Module, forwardRef } from '@nestjs/common'; // 新增 forwardRef 导入
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'speed_jwt_secret_key',
      signOptions: { expiresIn: 7200 }, // 已修复的数字格式
    }),
    // 修复：用 forwardRef 包装 AuthModule，解决循环依赖
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // 必须导出，供 AuthModule 使用
})
export class UserModule {}