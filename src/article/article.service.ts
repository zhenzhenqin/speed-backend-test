import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';

@Injectable()
export class ArticleService {
  // 注入Article模型（Nest.js依赖注入，作业“代码工艺”要求）
  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

  /**
   * 1. 提交文章（用户功能，作业核心需求）
   */
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    try {
      // 创建新文章（自动添加reviewStatus: pending）
      const newArticle = new this.articleModel(createArticleDto);
      return await newArticle.save();
    } catch (error) {
      // 捕获DOI重复的错误（MongoDB的unique约束触发）
      if (error.code === 11000) {
        throw new ConflictException('该DOI已被提交，请检查后重新提交');
      }
      throw error;
    }
  }

  /**
   * 2. 搜索文章（用户功能，仅返回已审核通过的文章）
   */
  async search(searchDto: SearchArticleDto): Promise<Article[]> {
    // 构建查询条件（支持模糊查询、年份范围）
    const query: any = { reviewStatus: 'approved' };  // 只查已通过审核的

    // 模糊查询：SE实践类型（不区分大小写）
    if (searchDto.practiceType) {
      query.practiceType = { $regex: searchDto.practiceType, $options: 'i' };
    }

    // 模糊查询：相关主张（不区分大小写）
    if (searchDto.claim) {
      query.claim = { $regex: searchDto.claim, $options: 'i' };
    }

    // 年份范围查询
    if (searchDto.yearStart && searchDto.yearEnd) {
      query.year = { $gte: searchDto.yearStart, $lte: searchDto.yearEnd };
    } else if (searchDto.yearStart) {
      query.year = { $gte: searchDto.yearStart };
    } else if (searchDto.yearEnd) {
      query.year = { $lte: searchDto.yearEnd };
    }

    // 执行查询，按出版年份倒序排列（最新的在前）
    return await this.articleModel.find(query).sort({ year: -1 }).exec();
  }

  /**
   * 3. 获取待审核文章列表（版主功能，作业审核流程需求）
   */
  async getPendingReviews(): Promise<Article[]> {
    return await this.articleModel.find({ reviewStatus: 'pending' }).sort({ createdAt: -1 }).exec();
  }

  /**
   * 4. 审核文章（版主功能，批准/拒绝）
   */
  async reviewArticle(id: string, status: 'approved' | 'rejected'): Promise<Article> {
    // 先检查文章是否存在
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    // 更新审核状态
    article.reviewStatus = status;
    return await article.save();
  }

  /**
   * 5. 用户评分（用户功能，作业要求）
   */
  async rateArticle(id: string, rating: number): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    // 更新评分
    article.rating = rating;
    return await article.save();
  }
}