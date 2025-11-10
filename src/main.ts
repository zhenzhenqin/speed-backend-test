import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';  // 全局数据校验
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cors from 'cors';  // 跨域支持

async function bootstrap() {
  // 创建Nest应用实例
  const app = await NestFactory.create(AppModule);

  // 1. 配置跨域（允许前端所有域名访问，开发环境可用）
  app.use(cors());

  // 2. 全局启用数据校验（DTO校验生效，作业“代码质量”要求）
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,  // 自动过滤DTO中未定义的字段
      forbidNonWhitelisted: true,  // 禁止提交DTO中未定义的字段（报错提示）
      transform: true,  // 自动将请求参数转换为DTO对应的类型（如字符串转数字）
    }),
  );

  // 3. 配置Swagger接口文档（访问地址：http://localhost:3000/api-docs）
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SPEED网站后端API')
    .setDescription('SE实践经验证据数据库的核心接口（提交/搜索/审核/评分）')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  // 启动服务（端口从.env文件读取，默认3000）
  await app.listen(process.env.PORT || 3000);
  console.log(`✅ 后端服务启动成功：http://localhost:${process.env.PORT || 3000}`);
  console.log(`📚 Swagger接口文档：http://localhost:${process.env.PORT || 3000}/api-docs`);
}

bootstrap();