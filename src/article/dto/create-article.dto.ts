import { IsString, IsNumber, IsEnum, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';

// 提交文章的参数校验规则（与前端表单字段一一对应）
export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: '文章标题不能为空' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '作者不能为空' })
  authors: string;

  @IsNumber({ allowNaN: false }, { message: '出版年份必须是数字' })
  @IsNotEmpty({ message: '出版年份不能为空' })
  @Min(1990, { message: '出版年份不能早于1990年' })
  @Max(new Date().getFullYear(), { message: '出版年份不能是未来年份' })
  year: number;

  @IsString()
  @IsNotEmpty({ message: 'SE实践类型不能为空' })
  practiceType: string;

  @IsString()
  @IsNotEmpty({ message: '相关主张不能为空' })
  claim: string;

  @IsEnum(['support', 'oppose', 'neutral'], {
    message: '证据结果只能是 support（支持）、oppose（反对）、neutral（中立）',
  })
  @IsNotEmpty({ message: '证据结果不能为空' })
  evidenceResult: 'support' | 'oppose' | 'neutral';

  @IsString()
  @IsNotEmpty({ message: 'DOI不能为空' })
  doi: string;

  // 审核状态无需前端传入，后端默认设置为pending，所以标记为可选
  @IsOptional()
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}