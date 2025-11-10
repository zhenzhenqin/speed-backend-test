import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SavedSearchService } from './saved-search.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('搜索保存')
@Controller('saved-searches')
@UseGuards(RolesGuard) // 需登录才能保存/查询
@ApiBearerAuth()
export class SavedSearchController {
  constructor(private readonly savedSearchService: SavedSearchService) {}

  /**
   * 保存搜索
   */
  @Post()
  @ApiOperation({ summary: '保存搜索条件（登录用户）' })
  @ApiBody({ type: CreateSavedSearchDto })
  async create(@Body() dto: CreateSavedSearchDto, @Request() req) {
    // req.user 是JWT解析后的用户信息（包含_id）
    return this.savedSearchService.create(req.user.sub, dto);
  }

  /**
   * 查询当前用户的所有保存搜索
   */
  @Get()
  @ApiOperation({ summary: '查询个人保存的所有搜索' })
  async findAll(@Request() req) {
    return this.savedSearchService.findAllByUser(req.user.sub);
  }

  /**
   * 删除保存的搜索
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除个人保存的搜索（只能删自己的）' })
  @ApiParam({ name: 'id', description: '保存搜索的ID' })
  async remove(@Param('id') savedSearchId: string, @Request() req) {
    return this.savedSearchService.remove(req.user.sub, savedSearchId);
  }

  /**
   * 重新运行保存的搜索（获取最新结果）
   */
  @Get(':id/rerun')
  @ApiOperation({ summary: '重新运行保存的搜索（返回最新结果的条件）' })
  @ApiParam({ name: 'id', description: '保存搜索的ID' })
  async rerunSearch(@Param('id') savedSearchId: string, @Request() req) {
    return this.savedSearchService.rerunSearch(savedSearchId, req.user.sub);
  }
}