import { Controller, Post, Get, Put, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { Article } from './article.schema';

// Swagger文档分类（前端查看接口时按“文章管理”分组）
@ApiTags('文章管理')
@Controller('articles')  // 接口基础路径：/articles
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /**
   * 1. 提交文章（POST /articles）
   */
  @Post()
  @ApiOperation({ summary: '用户提交学术文章' })  // Swagger接口描述
  create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articleService.create(createArticleDto);
  }

  /**
   * 2. 搜索文章（GET /articles/search）
   */
  @Get('search')
  @ApiOperation({ summary: '搜索已审核通过的文章' })
  @ApiQuery({ name: 'practiceType', required: false, description: 'SE实践类型（如TDD）' })
  @ApiQuery({ name: 'claim', required: false, description: '相关主张（如提升代码质量）' })
  @ApiQuery({ name: 'yearStart', required: false, description: '出版年份起始' })
  @ApiQuery({ name: 'yearEnd', required: false, description: '出版年份结束' })
  search(@Query() searchDto: SearchArticleDto): Promise<Article[]> {
    return this.articleService.search(searchDto);
  }

  /**
   * 3. 获取待审核文章列表（GET /articles/pending-reviews）
   */
  @Get('pending-reviews')
  @ApiOperation({ summary: '版主获取待审核文章列表' })
  getPendingReviews(): Promise<Article[]> {
    return this.articleService.getPendingReviews();
  }

  /**
   * 4. 审核文章（PUT /articles/review/:id）
   */
  @Put('review/:id')
  @ApiOperation({ summary: '版主审核文章（批准/拒绝）' })
  @ApiParam({ name: 'id', description: '文章ID（MongoDB的ObjectId）' })
  @ApiQuery({ name: 'status', enum: ['approved', 'rejected'], description: '审核结果' })
  reviewArticle(
    @Param('id') id: string,
    @Query('status') status: 'approved' | 'rejected',
  ): Promise<Article> {
    return this.articleService.reviewArticle(id, status);
  }

  /**
   * 5. 用户评分（PUT /articles/rate/:id）
   */
  @Put('rate/:id')
  @ApiOperation({ summary: '用户对文章评分（1-5星）' })
  @ApiParam({ name: 'id', description: '文章ID' })
  @ApiQuery({ name: 'rating', minimum: 1, maximum: 5, description: '评分（1-5）' })
  rateArticle(
    @Param('id') id: string,
    @Query('rating') rating: number,
  ): Promise<Article> {
    return this.articleService.rateArticle(id, rating);
  }
}