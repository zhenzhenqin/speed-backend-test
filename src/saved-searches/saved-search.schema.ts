// 导入NestJS和Mongoose的核心依赖
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// 关联用户模型（确保用户保存的搜索属于自己）
import { User } from '../user/user.schema';

// 导出Document类型，方便Service层操作（包含Mongoose内置方法）
export type SavedSearchDocument = SavedSearch & Document;

// 定义Schema（数据库表结构）
@Schema({
  collection: 'saved-searches', // MongoDB中的集合名（表名）
  timestamps: true, // 自动生成createdAt（创建时间）和updatedAt（更新时间）字段
  strict: true, // 严格模式：只允许存储Schema中定义的字段
})
export class SavedSearch {
  /**
   * 1. 关联的用户ID（谁保存的这个搜索）
   * - 必须字段，确保搜索归属于特定用户
   * - 引用users集合的ObjectId，实现数据关联
   */
  @Prop({
    required: [true, '保存搜索必须关联用户'],
    type: Types.ObjectId, // MongoDB的ObjectId类型
    ref: User.name, // 关联User模型（users集合）
    index: true, // 建立索引，提升查询效率（按用户查询保存的搜索时更快）
  })
  userId: Types.ObjectId;

  /**
   * 2. 搜索名称（用户自定义，方便识别）
   * - 比如“2020-2023 TDD相关文章”“持续集成支持的主张”
   */
  @Prop({
    required: [true, '搜索名称不能为空'],
    trim: true, // 自动去除前后空格
    minlength: [2, '搜索名称至少2个字符'],
    maxlength: [50, '搜索名称最多50个字符'],
  })
  name: string;

  /**
   * 3. 搜索条件（核心字段，存储用户的完整搜索参数）
   * - 和“文章搜索接口（/articles/search）”的参数完全一致
   * - 支持重新运行时直接复用这些条件，获取最新结果
   */
  @Prop({
    required: [true, '搜索条件不能为空'],
    type: Object, // 存储JSON格式的搜索参数（如{practiceType: "TDD", yearStart: 2020}）
    // 定义允许的字段（避免存储无效数据）
    schema: {
      practiceType: { type: String, trim: true },
      claim: { type: String, trim: true },
      yearStart: { type: Number, min: 1900 },
      yearEnd: { type: Number, max: new Date().getFullYear() },
      sort: { type: String, enum: ['title', 'year', 'rating', 'updatedAt'] },
      order: { type: String, enum: ['asc', 'desc'] },
    },
  })
  searchCriteria: {
    practiceType?: string;
    claim?: string;
    yearStart?: number;
    yearEnd?: number;
    sort?: 'title' | 'year' | 'rating' | 'updatedAt';
    order?: 'asc' | 'desc';
  };

  /**
   * 4. 保存时间（用户保存搜索的时间）
   * - 默认当前时间，无需用户手动传入
   */
  @Prop({
    type: Date,
    default: Date.now,
    index: true, // 建立索引，按保存时间排序时更快
  })
  savedAt: Date;
}

// 生成Mongoose的Schema实例，导出供Module使用
export const SavedSearchSchema = SchemaFactory.createForClass(SavedSearch);