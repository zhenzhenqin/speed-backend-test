import { IsEnum, IsString, IsNotEmpty, MinLength } from 'class-validator';

// 审核状态枚举（统一管理）
export enum ReviewStatus {
  PENDING = 'pending', // 待审核
  APPROVED = 'approved', // 通过（进入分析队列）
  REJECTED = 'rejected', // 拒绝（归入拒绝数据库）
}

// 分析状态枚举（统一管理）
export enum AnalyzeStatus {
  PENDING = 'pending', // 待分析
  COMPLETED = 'completed', // 已分析
  SKIPPED = 'skipped', // 无需分析
}

// 版主审核入参DTO
export class ReviewArticleDto {
  @IsEnum(ReviewStatus, { message: '审核结果只能是 pending/approved/rejected' })
  @IsNotEmpty({ message: '审核结果不能为空' })
  status: ReviewStatus;

  @IsString()
  @IsNotEmpty({ message: '审核意见不能为空' })
  @MinLength(10, { message: '审核意见至少10个字符，需说明：1.是否重复；2.是否SE实证相关；3.是否同行评审来源' })
  comment: string;
}