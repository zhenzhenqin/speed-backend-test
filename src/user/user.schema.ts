import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

// 角色枚举（固化4种角色，契合需求）
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ANALYST = 'analyst',
  ADMIN = 'admin',
}

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true, // 自动添加创建/更新时间
  strict: true,
})
export class User {
  // 用户名（唯一，用于登录）
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  // 密码（加密存储）
  @Prop({ required: true })
  password: string;

  // 邮箱（唯一，用于找回密码等）
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  // 角色（默认普通用户）
  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // 密码加密（保存前自动执行）
  @Prop({ type: Boolean, default: false })
  isActive: boolean; // 账号是否激活（默认激活）
}

const UserSchema = SchemaFactory.createForClass(User);

// 保存前加密密码（中间件，避免明文存储）
UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;
  // 仅当密码修改时才加密（避免更新其他字段时重复加密）
  if (!user.isModified('password')) return next();

  try {
    // 生成加密盐，强度10
    const salt = await bcrypt.genSalt(10);
    // 加密密码
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 自定义方法：验证密码是否正确
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export { UserSchema };