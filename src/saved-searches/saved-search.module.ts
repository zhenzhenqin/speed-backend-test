import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedSearchService } from './saved-search.service';
import { SavedSearchController } from './saved-search.controller';
import { SavedSearch, SavedSearchSchema } from './saved-search.schema';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SavedSearch.name, schema: SavedSearchSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [SavedSearchController],
  providers: [SavedSearchService],
})
export class SavedSearchModule {}