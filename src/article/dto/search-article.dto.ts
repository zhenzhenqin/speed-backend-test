import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

// 搜索文章的参数校验规则（支持模糊查询、年份范围）
export class SearchArticleDto {
  @IsString()
  @IsOptional()  // 可选参数，用户可不输
  practiceType?: string;

  @IsString()
  @IsOptional()
  claim?: string;

  @IsNumber()
  @IsOptional()
  @Min(1990, { message: '起始年份不能早于1990年' })
  yearStart?: number;

  @IsNumber()
  @IsOptional()
  @Max(new Date().getFullYear(), { message: '结束年份不能是未来年份' })
  yearEnd?: number;
}