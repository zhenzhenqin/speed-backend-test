import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';

export class SearchArticleDto {
  @IsOptional()
  @IsString()
  practiceType?: string;

  @IsOptional()
  @IsString()
  claim?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900, { message: '起始年份不能早于1900年' })
  yearStart?: number;

  @IsOptional()
  @IsNumber()
  @Max(new Date().getFullYear(), { message: '结束年份不能晚于当前年份' })
  yearEnd?: number;

  // 新增：排序字段（仅允许指定列排序）
  @IsOptional()
  @IsString()
  @IsIn(['title', 'year', 'rating', 'updatedAt'], {
    message: '排序字段只能是 title/year/rating/updatedAt'
  })
  sort?: string = 'updatedAt'; // 默认按更新时间排序

  // 新增：排序方向
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], {
    message: '排序方向只能是 asc（升序）或 desc（降序）'
  })
  order?: 'asc' | 'desc' = 'desc'; // 默认降序
}