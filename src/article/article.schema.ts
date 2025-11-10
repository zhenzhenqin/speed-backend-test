import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReviewStatus, AnalyzeStatus } from './dto/review-article.dto';

export type ArticleDocument = Article & Document;

@Schema({
  collection: 'articles',
  timestamps: true,
  strict: true,
})
export class Article {
  // 文章基础信息
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  authors: string;

  @Prop({ required: true, min: 1900, max: new Date().getFullYear() })
  year: number;

  @Prop({ required: true, trim: true })
  practiceType: string;

  @Prop({ required: true, trim: true })
  claim: string;

  @Prop({ required: true, trim: true })
  evidenceResult: string;

  @Prop({ required: true, unique: true, trim: true })
  doi: string; // 唯一约束，确保非重复

  // 审核相关字段
  @Prop({
    required: true,
    type: String,
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  reviewStatus: ReviewStatus; // 待审核/通过/拒绝

  @Prop({
    required: true,
    trim: true,
    default: '待版主审核（需校验：非重复、SE实证相关、同行评审来源）',
  })
  reviewComment: string; // 版主审核意见

  // 分析相关字段
  @Prop({
    required: true,
    type: String,
    enum: AnalyzeStatus,
    default: AnalyzeStatus.SKIPPED,
  })
  analyzeStatus: AnalyzeStatus; // 待分析/已分析/无需分析

  // 评分字段
  @Prop({ type: Number, min: 1, max: 5, default: null })
  rating: number | null;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);