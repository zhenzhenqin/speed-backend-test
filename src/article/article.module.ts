import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // 必须导入
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article, ArticleSchema } from './article.schema'; // 导入Schema和实体

@Module({
  // 关键修复：注册Article的Schema，让Nest创建ArticleModel并可供注入
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }])
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}