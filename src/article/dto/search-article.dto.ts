import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

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
}