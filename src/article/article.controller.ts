import { Controller, Post, Get, Put, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { ReviewArticleDto, ReviewStatus } from './dto/review-article.dto';
import { Article } from './article.schema';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.schema';
import { UpdateArticleAdminDto } from './dto/update-article-admin.dto';

@ApiTags('文章管理')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /**
   * 1. 提交文章（所有登录用户均可）
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ANALYST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交学术文章（需登录，默认待审核）' })
  @ApiBody({ type: CreateArticleDto })
  async create(@Body() createDto: CreateArticleDto): Promise<Article> {
    return this.articleService.create(createDto);
  }

  /**
   * 2. 搜索已通过审核的文章（所有登录用户均可）
   */
  @Get('search')
// 注意：如果需要「无权限搜索」，删除下面两行（@UseGuards和@Roles）
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ANALYST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '搜索已通过审核的文章（支持排序）' })
  @ApiQuery({ name: 'practiceType', required: false, description: 'SE实践类型（如TDD、结对编程）' })
  @ApiQuery({ name: 'claim', required: false, description: '核心主张（模糊搜索）' })
  @ApiQuery({ name: 'yearStart', required: false, description: '出版年份起始' })
  @ApiQuery({ name: 'yearEnd', required: false, description: '出版年份结束' })
// 新增排序参数注解
  @ApiQuery({ name: 'sort', required: false, description: '排序字段（title/year/rating/updatedAt）', example: 'year' })
  @ApiQuery({ name: 'order', required: false, description: '排序方向（asc/desc）', example: 'asc' })
  async search(@Query() searchDto: SearchArticleDto): Promise<Article[]> {
    return this.articleService.search(searchDto);
  }

  /**
   * 3. 获取待审核文章列表（仅版主/管理员）
   */
  @Get('pending-reviews')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取待审核文章（仅版主/管理员）' })
  async getPendingReviews(): Promise<Article[]> {
    return this.articleService.getPendingReviews();
  }

  /**
   * 4. 版主审核文章（仅版主/管理员，核心功能）
   */
  @Put('review/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '版主审核文章（需校验：1.非重复；2.SE实证相关；3.同行评审来源）' })
  @ApiParam({ name: 'id', description: '待审核文章ID' })
  @ApiBody({
    type: ReviewArticleDto,
    examples: {
      '审核通过': {
        summary: '满足所有3个条件，进入分析队列',
        value: {
          status: 'approved',
          comment: '1.DOI未重复；2.内容围绕SE实证评估（TDD对代码质量的影响）；3.发表于同行评审会议ICSE，符合要求，进入分析队列。'
        }
      },
      '审核拒绝-非SE相关': {
        summary: '不满足「SE实证相关」条件，归入拒绝数据库',
        value: {
          status: 'rejected',
          comment: '1.DOI未重复；2.内容为软件开发工具介绍，未涉及软件工程实证评估；3.不符合核心要求，归入拒绝数据库。'
        }
      },
      '审核拒绝-非同行评审': {
        summary: '不满足「同行评审来源」条件，归入拒绝数据库',
        value: {
          status: 'rejected',
          comment: '1.DOI未重复；2.内容围绕SE实证评估；3.发表于非同行评审的博客平台，不符合要求，归入拒绝数据库。'
        }
      }
    }
  })
  async reviewArticle(
    @Param('id') id: string,
    @Body() reviewDto: ReviewArticleDto,
  ): Promise<Article> {
    return this.articleService.reviewArticle(id, reviewDto);
  }

  /**
   * 5. 文章评分（所有登录用户均可）
   */
  @Put('rate/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ANALYST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '对已通过审核的文章评分（需登录）' })
  @ApiParam({ name: 'id', description: '文章ID' })
  @ApiQuery({ name: 'rating', minimum: 1, maximum: 5, description: '评分（1-5星）' })
  async rateArticle(
    @Param('id') id: string,
    @Query('rating') rating: number,
  ): Promise<Article> {
    return this.articleService.rateArticle(id, rating);
  }

  /**
   * 6. 查询待分析文章（仅分析师/管理员）
   */
  @Get('analyze/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ANALYST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询审核通过的待分析文章（仅分析师/管理员）' })
  async getPendingAnalyzeArticles(): Promise<Article[]> {
    return this.articleService.getPendingAnalyzeArticles();
  }

  /**
   * 管理员修改文章所有字段（核心接口）
   */
  @Put('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN) // 仅管理员可访问
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员修改文章所有字段（权限：仅管理员）' })
  @ApiParam({ name: 'id', description: '文章ID' })
  @ApiBody({ type: UpdateArticleAdminDto })
  async updateArticleByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateArticleAdminDto,
  ): Promise<Article> {
    return this.articleService.updateArticleByAdmin(id, dto);
  }
}