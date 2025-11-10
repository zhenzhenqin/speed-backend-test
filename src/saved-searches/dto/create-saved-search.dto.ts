import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchArticleDto } from '../../article/dto/search-article.dto';

export class CreateSavedSearchDto {
  // 搜索名称（用户自定义）
  @IsString()
  @IsNotEmpty({ message: '搜索名称不能为空' })
  @MinLength(2, { message: '搜索名称至少2个字符' })
  @MaxLength(50, { message: '搜索名称最多50个字符' })
  name: string;

  // 搜索条件（与搜索接口的参数一致）
  @IsObject()
  @ValidateNested()
  @Type(() => SearchArticleDto)
  searchCriteria: SearchArticleDto;
}