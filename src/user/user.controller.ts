import { Controller, Post, Body, UseGuards, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRole } from './user.schema';
import { RolesGuard } from '../auth/roles.guard'; // 后续创建的权限守卫
import { Roles } from '../auth/roles.decorator'; // 后续创建的角色装饰器

@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 注册接口（公开，无需权限）
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册（默认普通用户）' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  /**
   * 登录接口（公开，无需权限）
   */
  @Post('login')
  @ApiOperation({ summary: '用户登录（返回JWT token）' })
  login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto);
  }

  /**
   * 管理员：修改用户角色（仅管理员可访问）
   */
  @Put(':id/role')
  @UseGuards(RolesGuard) // 启用权限守卫
  @Roles(UserRole.ADMIN) // 仅管理员可调用
  @ApiOperation({ summary: '修改用户角色（仅管理员）' })
  updateRole(
    @Param('id') userId: string,
    @Body('role') newRole: UserRole,
  ) {
    return this.userService.updateRole(userId, newRole);
  }
}