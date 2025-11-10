import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';  // 环境变量模块
import { MongooseModule } from '@nestjs/mongoose';  // MongoDB模块
import { ArticleModule } from './article/article.module';  // 文章模块
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 加载环境变量（.env文件），全局可用
    ConfigModule.forRoot({ isGlobal: true }),
    // 连接MongoDB（地址从.env文件读取）
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/speed_db'),
    // 引入文章模块（核心业务模块）
    ArticleModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}