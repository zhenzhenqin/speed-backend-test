import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// 新增导入
import { SavedSearchModule } from './saved-searches/saved-search.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/speed_db'), // 你的MongoDB地址
    ArticleModule,
    UserModule,
    AuthModule,
    SavedSearchModule, // 注册搜索保存模块
  ],
})
export class AppModule {}