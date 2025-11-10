import { IsString, IsNotEmpty } from 'class-validator';

//登录
/**
 * author: mjc
 * 2025.11.10
 */
export class LoginUserDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}