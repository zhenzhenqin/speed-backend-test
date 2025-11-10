import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../user/user.schema';

// 定义元数据key
export const ROLES_KEY = 'roles';

// 自定义装饰器：@Roles(UserRole.USER, UserRole.MODERATOR)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);