import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../user/user.schema';
import { AuthGuard } from '@nestjs/passport';

// 组合JWT认证守卫和角色权限守卫（先验证token，再验证角色）
@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 先执行JWT认证（验证token是否有效）
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // 2. 获取接口标记的“允许访问的角色”
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 3. 若接口未标记角色，默认允许所有已认证用户访问
    if (!requiredRoles) {
      return true;
    }

    // 4. 获取当前登录用户的角色
    const { user } = context.switchToHttp().getRequest();

    // 5. 验证用户角色是否在允许列表中
    const hasPermission = requiredRoles.includes(user.role);
    if (!hasPermission) {
      throw new ForbiddenException('您没有访问该接口的权限');
    }

    return true;
  }
}