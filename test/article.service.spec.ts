// src/article/article.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getModelToken } from '@nestjs/mongoose';
import { Article } from './article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { SearchArticleDto } from './dto/search-article.dto';
import { ReviewArticleDto, ReviewStatus, AnalyzeStatus } from './dto/review-article.dto';
import { UpdateArticleAdminDto } from './dto/update-article-admin.dto';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockArticleModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  toObject: jest.fn(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

describe('ArticleService', () => {
  let service: ArticleService;
  let model: typeof mockArticleModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getModelToken(Article.name),
          useValue: mockArticleModel,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    model = module.get(getModelToken(Article.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createDto: CreateArticleDto = {
        doi: '10.1234/test',
        title: 'Test Article',
        authors: ['Author One'],
        year: 2023,
        practiceType: 'TDD',
        claim: 'Testing improves code quality',
      };

      mockArticleModel.findOne.mockResolvedValue(null);
      mockArticleModel.save.mockResolvedValue({ ...createDto, _id: new Types.ObjectId() });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.doi).toBe(createDto.doi);
      expect(result.title).toBe(createDto.title);
    });

    it('should throw ConflictException if DOI already exists', async () => {
      const createDto: CreateArticleDto = {
        doi: '10.1234/test',
        title: 'Test Article',
        authors: ['Author One'],
        year: 2023,
        practiceType: 'TDD',
        claim: 'Testing improves code quality',
      };

      mockArticleModel.findOne.mockResolvedValue({ doi: '10.1234/test' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('search', () => {
    it('should search articles with filters', async () => {
      const searchDto: SearchArticleDto = {
        practiceType: 'TDD',
        claim: 'test',
        yearStart: 2020,
        yearEnd: 2023,
      };

      const mockArticles = [
        { _id: new Types.ObjectId(), doi: '10.1234/test1', title: 'Test 1' },
        { _id: new Types.ObjectId(), doi: '10.1234/test2', title: 'Test 2' },
      ];

      mockArticleModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockArticles),
      });

      const result = await service.search(searchDto);

      expect(result).toHaveLength(2);
      expect(mockArticleModel.find).toHaveBeenCalledWith({
        reviewStatus: ReviewStatus.APPROVED,
        practiceType: searchDto.practiceType,
        claim: { $regex: searchDto.claim, $options: 'i' },
        year: { $gte: searchDto.yearStart, $lte: searchDto.yearEnd },
      });
    });
  });

  describe('reviewArticle', () => {
    it('should review an article', async () => {
      const articleId = new Types.ObjectId().toString();
      const reviewDto: ReviewArticleDto = {
        status: ReviewStatus.APPROVED,
        comment: 'Good article',
      };

      const articleMock = {
        _id: articleId,
        reviewStatus: ReviewStatus.PENDING,
        save: jest.fn().mockResolvedValue({
          _id: articleId,
          reviewStatus: ReviewStatus.APPROVED,
          reviewComment: 'Good article',
          analyzeStatus: AnalyzeStatus.PENDING,
        }),
      };

      mockArticleModel.findById.mockResolvedValue(articleMock);

      const result = await service.reviewArticle(articleId, reviewDto);

      expect(result).toBeDefined();
      expect(result.reviewStatus).toBe(ReviewStatus.APPROVED);
      expect(result.analyzeStatus).toBe(AnalyzeStatus.PENDING);
    });

    it('should throw ForbiddenException if article is already reviewed', async () => {
      const articleId = new Types.ObjectId().toString();
      const reviewDto: ReviewArticleDto = {
        status: ReviewStatus.APPROVED,
        comment: 'Good article',
      };

      const articleMock = {
        reviewStatus: ReviewStatus.APPROVED,
      };

      mockArticleModel.findById.mockResolvedValue(articleMock);

      await expect(service.reviewArticle(articleId, reviewDto)).rejects.toThrow(ForbiddenException);
    });
  });
});
