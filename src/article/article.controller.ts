import { Controller, Post, Get, Put, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { Article } from './article.schema';
import { RolesGuard } from '../auth/roles.guard'; // 导入权限守卫
import { Roles } from '../auth/roles.decorator'; // 导入角色装饰器
import { UserRole } from '../user/user.schema'; // 导入角色枚举

@ApiTags('文章管理')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /**
   * 1. 提交文章（普通用户/版主/分析师/管理员均可）
   */
  @Post()
  @UseGuards(RolesGuard) // 启用权限守卫
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ANALYST, UserRole.ADMIN) // 允许的角色
  @ApiBearerAuth() // Swagger标记需要token
  @ApiOperation({ summary: '提交学术文章（需登录）' })
  create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articleService.create(createArticleDto);
  }

  /**
   * 2. 搜索文章（仅已审核通过的，所有登录用户均可）
   */
  @Get('search')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ANALYST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '搜索已审核通过的文章（需登录）' })
  @ApiQuery({ name: 'practiceType', required: false, description: 'SE实践类型（如TDD）' })
  @ApiQuery({ name: 'claim', required: false, description: '相关主张（如提升代码质量）' })
  @ApiQuery({ name: 'yearStart', required: false, description: '出版年份起始' })
  @ApiQuery({ name: 'yearEnd', required: false, description: '出版年份结束' })
  search(@Query() searchDto: SearchArticleDto): Promise<Article[]> {
    return this.articleService.search(searchDto);
  }

  /**
   * 3. 获取待审核文章列表（仅版主/管理员）
   */
  @Get('pending-reviews')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN) // 仅版主和管理员
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取待审核文章列表（仅版主/管理员）' })
  getPendingReviews(): Promise<Article[]> {
    return this.articleService.getPendingReviews();
  }

  /**
   * 4. 审核文章（仅版主/管理员）
   */
  @Put('review/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核文章（仅版主/管理员）' })
  @ApiParam({ name: 'id', description: '文章ID' })
  @ApiQuery({ name: 'status', enum: ['approved', 'rejected'], description: '审核结果' })
  reviewArticle(
    @Param('id') id: string,
    @Query('status') status: 'approved' | 'rejected',
  ): Promise<Article> {
    return this.articleService.reviewArticle(id, status);
  }

  /**
   * 5. 用户评分（仅普通用户/版主/分析师/管理员）
   */
  @Put('rate/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ANALYST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '对文章评分（需登录）' })
  @ApiParam({ name: 'id', description: '文章ID' })
  @ApiQuery({ name: 'rating', minimum: 1, maximum: 5, description: '评分（1-5）' })
  rateArticle(
    @Param('id') id: string,
    @Query('rating') rating: number,
  ): Promise<Article> {
    return this.articleService.rateArticle(id, rating);
  }

  /**
   * 6. 分析师：获取所有已审核文章（用于分析，仅分析师/管理员）
   */
  @Get('all-approved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有已审核文章（仅分析师/管理员）' })
  getAllApprovedArticles(): Promise<Article[]> {
    return this.articleService.search({}); // 空条件查询所有已审核文章
  }
}