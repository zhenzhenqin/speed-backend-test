import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ANALYST = 'analyst',
  ADMIN = 'admin',
}

// 已正确声明的接口（无需修改）
export interface UserDocument extends User, Document {
  comparePassword(password: string): Promise<boolean>;
}

@Schema({
  collection: 'users',
  timestamps: true,
  strict: true,
})
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

// 修复：类型断言改为 "this as unknown as UserDocument"
UserSchema.pre('save', async function (next) {
  // 先转为unknown，再转为UserDocument，避免类型冲突
  const user = this as unknown as UserDocument;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 自定义方法（无需修改）
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export { UserSchema };