import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

//注册
/**
 * author: mjc
 * 2025.11.10
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  username: string;

  @IsEmail({}, { message: '请输入有效的邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;
}