import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument, UserRole } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';


/**
 * author:mjc
 * 2025.11.10
 */
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService, // JWT服务（生成token）
  ) {}

  /**
   * 1. 用户注册（默认普通用户角色）
   */
  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      // 检查用户名/邮箱是否已存在
      const existingUser = await this.userModel.findOne({
        $or: [{ username: createUserDto.username }, { email: createUserDto.email }],
      }).exec();

      if (existingUser) {
        throw new ConflictException('用户名或邮箱已被注册');
      }

      // 创建用户（密码会通过Schema中间件自动加密）
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();

      // 返回用户信息（隐藏密码）
      const { password, ...userWithoutPassword } = savedUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 2. 用户登录（生成JWT token）
   */
  async login(loginDto: LoginUserDto): Promise<{ token: string; user: Omit<User, 'password'> }> {
    // 1. 查找用户
    const user = await this.userModel.findOne({ username: loginDto.username }).exec() as UserDocument;
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 现在TypeScript能识别 comparePassword 方法了
    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. 生成JWT token（包含用户ID和角色，有效期2小时）
    const token = this.jwtService.sign({
      sub: user._id, // 用户ID
      username: user.username,
      role: user.role, // 角色（用于后续权限判断）
    });

    // 4. 返回token和用户信息（隐藏密码）
    const { password, ...userWithoutPassword } = user.toObject();
    return { token, user: userWithoutPassword };
  }

  /**
   * 3. 根据用户ID查找用户（权限验证时用）
   */
  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 4. 管理员：修改用户角色（可选功能，用于给他人分配版主/分析师权限）
   */
  async updateRole(userId: string, newRole: UserRole): Promise<Omit<User, 'password'>> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.role = newRole;
    const updatedUser = await user.save();

    const { password, ...userWithoutPassword } = updatedUser.toObject();
    return userWithoutPassword;
  }
}