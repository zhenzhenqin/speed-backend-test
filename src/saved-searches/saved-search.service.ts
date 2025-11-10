import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavedSearch, SavedSearchDocument } from './saved-search.schema';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';

@Injectable()
export class SavedSearchService {
  constructor(
    @InjectModel(SavedSearch.name) private savedSearchModel: Model<SavedSearchDocument>,
  ) {}

  /**
   * 保存搜索结果（登录用户）
   */
  async create(userId: string, dto: CreateSavedSearchDto): Promise<SavedSearch> {
    // 转换userId为ObjectId
    const userObjectId = new Types.ObjectId(userId);

    const newSavedSearch = new this.savedSearchModel({
      userId: userObjectId,
      name: dto.name,
      searchCriteria: dto.searchCriteria,
    });

    return newSavedSearch.save();
  }

  /**
   * 查询当前用户的所有保存搜索
   */
  async findAllByUser(userId: string): Promise<SavedSearch[]> {
    const userObjectId = new Types.ObjectId(userId);
    return this.savedSearchModel
      .find({ userId: userObjectId })
      .sort({ savedAt: -1 }) // 按保存时间倒序
      .exec();
  }

  /**
   * 删除当前用户的某个保存搜索（只能删自己的）
   */
  async remove(userId: string, savedSearchId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const savedSearch = await this.savedSearchModel.findById(savedSearchId).exec();

    if (!savedSearch) {
      throw new NotFoundException(`ID为${savedSearchId}的保存搜索不存在`);
    }

    // 验证所有权（只能删自己的）
    if (savedSearch.userId.toString() !== userObjectId.toString()) {
      throw new ForbiddenException('无权限删除他人的保存搜索');
    }

    await this.savedSearchModel.findByIdAndDelete(savedSearchId).exec();
  }

  /**
   * 重新运行保存的搜索（返回最新结果）
   */
  async rerunSearch(savedSearchId: string, userId: string): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);
    const savedSearch = await this.savedSearchModel.findById(savedSearchId).exec();

    if (!savedSearch) {
      throw new NotFoundException(`ID为${savedSearchId}的保存搜索不存在`);
    }

    // 验证所有权
    if (savedSearch.userId.toString() !== userObjectId.toString()) {
      throw new ForbiddenException('无权限运行他人的保存搜索');
    }

    // 返回搜索条件（前端用这个条件调用/article/search接口，获取最新结果）
    return savedSearch.searchCriteria;
  }
}