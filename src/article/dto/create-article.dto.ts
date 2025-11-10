import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator'; // 移除 Trim 导入

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: '文章标题不能为空' })
  title: string; // 移除 @Trim()，Schema 层已配置 trim: true

  @IsString()
  @IsNotEmpty({ message: '作者不能为空' })
  authors: string; // 移除 @Trim()

  @IsNumber()
  @Min(1900, { message: '出版年份不能早于1900年' })
  @Max(new Date().getFullYear(), { message: '出版年份不能晚于当前年份' })
  year: number;

  @IsString()
  @IsNotEmpty({ message: 'SE实践类型不能为空（如TDD、结对编程、持续集成）' })
  practiceType: string; // 移除 @Trim()

  @IsString()
  @IsNotEmpty({ message: '核心主张不能为空' })
  claim: string; // 移除 @Trim()

  @IsString()
  @IsNotEmpty({ message: '证据结果不能为空（支持/反对/中立）' })
  evidenceResult: string; // 移除 @Trim()

  @IsString()
  @IsNotEmpty({ message: 'DOI不能为空' })
  doi: string; // 移除 @Trim()
}