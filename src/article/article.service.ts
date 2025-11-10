import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { ReviewArticleDto, ReviewStatus, AnalyzeStatus } from './dto/review-article.dto';
import { UpdateArticleAdminDto } from './dto/update-article-admin.dto';

@Injectable()
export class ArticleService {
  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

  /**
   * 提交文章（普通用户/版主/分析师/管理员）
   */
  async create(createDto: CreateArticleDto): Promise<Article> {
    // 校验DOI是否重复（非重复条件）
    const existingArticle = await this.articleModel.findOne({ doi: createDto.doi }).exec();
    if (existingArticle) {
      throw new ConflictException('该DOI已被提交，请检查后重新提交（非重复校验不通过）');
    }

    // 创建文章（默认待审核）
    const newArticle = new this.articleModel(createDto);
    const savedArticle = await newArticle.save();
    return savedArticle.toObject();
  }

  /**
   * 搜索已审核通过的文章（所有登录用户）
   */
  async search(searchDto: SearchArticleDto): Promise<Article[]> {
    const query: any = { reviewStatus: ReviewStatus.APPROVED }; // 只返回已通过审核的

    // 拼接搜索条件（原有逻辑不变）
    if (searchDto.practiceType) query.practiceType = searchDto.practiceType;
    if (searchDto.claim) query.claim = { $regex: searchDto.claim, $options: 'i' }; // 模糊搜索
    if (searchDto.yearStart && searchDto.yearEnd) {
      query.year = { $gte: searchDto.yearStart, $lte: searchDto.yearEnd };
    } else if (searchDto.yearStart) {
      query.year = { $gte: searchDto.yearStart };
    } else if (searchDto.yearEnd) {
      query.year = { $lte: searchDto.yearEnd };
    }

    // 新增：拼接排序条件（Mongoose 排序：1=升序，-1=降序）
    const sortField = searchDto.sort || 'updatedAt';
    const sortOption: any = {};
    sortOption[sortField] = searchDto.order === 'desc' ? -1 : 1;

    return this.articleModel
      .find(query)
      .sort(sortOption)
      .exec();
  }

  /**
   * 获取待审核文章（仅版主/管理员）
   */
  async getPendingReviews(): Promise<Article[]> {
    return this.articleModel
      .find({ reviewStatus: ReviewStatus.PENDING })
      .sort({ createdAt: -1 }) // 按提交时间倒序
      .exec();
  }

  /**
   * 版主审核文章（核心功能）
   */
  async reviewArticle(id: string, reviewDto: ReviewArticleDto): Promise<Article> {
    // 1. 校验文章是否存在
    const article = await this.articleModel.findById(id).exec() as ArticleDocument;
    if (!article) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    // 2. 校验是否已审核
    if (article.reviewStatus !== ReviewStatus.PENDING) {
      throw new ForbiddenException(`该文章已审核（状态：${article.reviewStatus}），无需重复操作`);
    }

    // 3. 更新审核状态和意见
    article.reviewStatus = reviewDto.status;
    article.reviewComment = reviewDto.comment;

    // 4. 状态流转：通过→待分析；拒绝→无需分析
    if (reviewDto.status === ReviewStatus.APPROVED) {
      article.analyzeStatus = AnalyzeStatus.PENDING;
    } else {
      article.analyzeStatus = AnalyzeStatus.SKIPPED;
    }

    const updatedArticle = await article.save();
    return updatedArticle.toObject();
  }

  /**
   * 文章评分（所有登录用户）
   */
  async rateArticle(id: string, rating: number): Promise<Article> {
    const article = await this.articleModel.findById(id).exec() as ArticleDocument;
    if (!article) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    // 只能对已通过审核的文章评分
    if (article.reviewStatus !== ReviewStatus.APPROVED) {
      throw new ForbiddenException('仅能对已通过审核的文章评分');
    }

    article.rating = rating;
    const updatedArticle = await article.save();
    return updatedArticle.toObject();
  }

  /**
   * 查询待分析文章（仅分析师/管理员）
   */
  async getPendingAnalyzeArticles(): Promise<Article[]> {
    return this.articleModel
      .find({
        reviewStatus: ReviewStatus.APPROVED,
        analyzeStatus: AnalyzeStatus.PENDING,
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * 管理员更新文章所有字段（核心方法）
   */
  async updateArticleByAdmin(id: string, dto: UpdateArticleAdminDto): Promise<Article> {
    // 先校验文章是否存在（复用之前的逻辑，避免重复代码）
    const articleExists = await this.articleModel.findById(id).exec();
    if (!articleExists) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    // 校验DOI重复（原有逻辑不变）
    if (dto.doi && dto.doi !== articleExists.doi) {
      const existingArticle = await this.articleModel.findOne({ doi: dto.doi }).exec();
      if (existingArticle) {
        throw new ConflictException(`DOI ${dto.doi} 已被其他文章使用，无法修改`);
      }
    }

    // 执行更新（此时articleExists已存在，updatedArticle不会为null）
    const updatedArticle = await this.articleModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec() as ArticleDocument; // 断言为ArticleDocument，确保有toObject()

    return updatedArticle.toObject();
  }
}