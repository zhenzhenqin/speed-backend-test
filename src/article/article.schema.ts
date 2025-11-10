import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// TypeScript类型提示（作业“代码质量”要求，避免类型混乱）
export type ArticleDocument = Article & Document;

@Schema({
  collection: 'articles',  // MongoDB集合名（固定为articles）
  timestamps: true,        // 自动添加createdAt（创建时间）、updatedAt（更新时间）
  strict: true,            // 禁止存储Schema中未定义的字段（数据安全，作业隐含要求）
})
export class Article {
  // 1. 文章标题（必填，作业要求“提交文章需包含标题”）
  @Prop({
    required: [true, '文章标题不能为空'],  // 必选，自定义错误提示
    type: String,
    trim: true,  // 自动去除首尾空格（数据清洗）
  })
  title: string;

  // 2. 作者（必填，多个作者用逗号分隔，如“张三, 李四”）
  @Prop({
    required: [true, '作者不能为空'],
    type: String,
    trim: true,
  })
  authors: string;

  // 3. 出版年份（必填，作业要求“提交文章需包含出版年份”）
  @Prop({
    required: [true, '出版年份不能为空'],
    type: Number,
    min: 1990,  // 合理范围限制（避免无效年份）
    max: new Date().getFullYear(),  // 不允许未来年份
  })
  year: number;

  // 4. SE实践类型（必填，如“TDD、结对编程、持续集成”）
  @Prop({
    required: [true, 'SE实践类型不能为空'],
    type: String,
    trim: true,
  })
  practiceType: string;

  // 5. 相关主张（必填，如“提升代码质量、减少bug、提高开发效率”）
  @Prop({
    required: [true, '相关主张不能为空'],
    type: String,
    trim: true,
  })
  claim: string;

  // 6. 证据结果（必填，只能是3个选项，作业要求“明确证据支持/反对/中立”）
  @Prop({
    required: [true, '证据结果不能为空'],
    type: String,
    enum: {
      values: ['support', 'oppose', 'neutral'],
      message: '证据结果只能是 support（支持）、oppose（反对）、neutral（中立）',
    },
  })
  evidenceResult: 'support' | 'oppose' | 'neutral';

  // 7. DOI（必填+唯一，作业要求“不能放PDF，仅提供DOI”）
  @Prop({
    required: [true, 'DOI不能为空'],
    type: String,
    trim: true,
    unique: [true, '该DOI已存在，请检查后重新提交'],  // 避免重复提交
  })
  doi: string;

  // 8. 审核状态（必填，默认待审核，作业要求“版主审核流程”）
  @Prop({
    required: true,
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',  // 新提交的文章默认“待审核”
  })
  reviewStatus: 'pending' | 'approved' | 'rejected';

  // 9. 用户评分（可选，1-5星，作业要求“用户可对文章评分”）
  @Prop({
    type: Number,
    min: 1,
    max: 5,
    default: null,  // 初始无评分
  })
  rating: number;
}

// 创建Schema（MongoDB集合的结构定义，Nest.js会自动关联）
export const ArticleSchema = SchemaFactory.createForClass(Article);