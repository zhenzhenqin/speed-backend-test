// src/saved-searches/saved-search.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SavedSearchService } from './saved-search.service';
import { getModelToken } from '@nestjs/mongoose';
import { SavedSearch } from './saved-search.schema';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockSavedSearchModel = {
  new: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

describe('SavedSearchService', () => {
  let service: SavedSearchService;
  let model: typeof mockSavedSearchModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSearchService,
        {
          provide: getModelToken(SavedSearch.name),
          useValue: mockSavedSearchModel,
        },
      ],
    }).compile();

    service = module.get<SavedSearchService>(SavedSearchService);
    model = module.get(getModelToken(SavedSearch.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a saved search', async () => {
      const userId = new Types.ObjectId().toString();
      const dto: CreateSavedSearchDto = {
        name: 'My Search',
        searchCriteria: { practiceType: 'TDD' },
      };

      const savedSearchMock = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        name: dto.name,
        searchCriteria: dto.searchCriteria,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          name: dto.name,
          searchCriteria: dto.searchCriteria,
        }),
      };

      mockSavedSearchModel.new.mockReturnValue(savedSearchMock);

      const result = await service.create(userId, dto);

      expect(result).toBeDefined();
      expect(result.name).toBe(dto.name);
      expect(result.searchCriteria).toEqual(dto.searchCriteria);
    });
  });

  describe('findAllByUser', () => {
    it('should find all saved searches for a user', async () => {
      const userId = new Types.ObjectId().toString();
      const mockSavedSearches = [
        { _id: new Types.ObjectId(), name: 'Search 1' },
        { _id: new Types.ObjectId(), name: 'Search 2' },
      ];

      mockSavedSearchModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSavedSearches),
      });

      const result = await service.findAllByUser(userId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Search 1');
    });
  });

  describe('remove', () => {
    it('should remove a saved search', async () => {
      const userId = new Types.ObjectId().toString();
      const savedSearchId = new Types.ObjectId().toString();

      const savedSearchMock = {
        _id: savedSearchId,
        userId: new Types.ObjectId(userId),
      };

      mockSavedSearchModel.findById.mockResolvedValue(savedSearchMock);
      mockSavedSearchModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove(userId, savedSearchId)).resolves.toBeUndefined();
    });

    it('should throw ForbiddenException if user does not own the saved search', async () => {
      const userId = new Types.ObjectId().toString();
      const savedSearchId = new Types.ObjectId().toString();
      const otherUserId = new Types.ObjectId().toString();

      const savedSearchMock = {
        _id: savedSearchId,
        userId: new Types.ObjectId(otherUserId),
      };

      mockSavedSearchModel.findById.mockResolvedValue(savedSearchMock);

      await expect(service.remove(userId, savedSearchId)).rejects.toThrow(ForbiddenException);
    });
  });
});
