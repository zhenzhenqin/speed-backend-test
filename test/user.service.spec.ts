// src/user/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  toObject: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let model: typeof mockUserModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.save.mockResolvedValue({ ...createUserDto, _id: new Types.ObjectId() });

      const result = await service.register(createUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe(createUserDto.username);
      expect(result.email).toBe(createUserDto.email);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        $or: [{ username: createUserDto.username }, { email: createUserDto.email }],
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue({ username: 'testuser' });

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const loginDto: LoginUserDto = {
        username: 'testuser',
        password: 'password123',
      };

      const userMock = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        password: 'hashedPassword',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(),
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
        }),
      };

      mockUserModel.findOne.mockResolvedValue(userMock);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.token).toBe('test-token');
      expect(result.user.username).toBe(loginDto.username);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginUserDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const userMock = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockUserModel.findOne.mockResolvedValue(userMock);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const userId = new Types.ObjectId().toString();
      const userMock = {
        _id: userId,
        username: 'testuser',
      };

      mockUserModel.findById.mockResolvedValue(userMock);

      const result = await service.findById(userId);

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = new Types.ObjectId().toString();

      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
