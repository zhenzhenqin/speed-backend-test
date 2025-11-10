import { IsOptional, IsString, IsNumber, Min, Max, IsEnum, IsObject } from 'class-validator';
import { ReviewStatus, AnalyzeStatus } from './review-article.dto';

export class UpdateArticleAdminDto {
  // 所有字段均为可选，管理员可修改任意字段
  @IsOptional()
  @IsString()
  @IsEnum(ReviewStatus)
  reviewStatus?: ReviewStatus;

  @IsOptional()
  @IsString()
  @IsEnum(AnalyzeStatus)
  analyzeStatus?: AnalyzeStatus;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  authors?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year?: number;

  @IsOptional()
  @IsString()
  practiceType?: string;

  @IsOptional()
  @IsString()
  claim?: string;

  @IsOptional()
  @IsString()
  evidenceResult?: string;

  @IsOptional()
  @IsString()
  doi?: string;

  @IsOptional()
  @IsString()
  reviewComment?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}