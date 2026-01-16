import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitChallengeDto } from './dto/submit-challenge.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('difficulty') difficulty?: string,
    @Query('language') language?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.challengesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      difficulty,
      language,
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.challengesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.instructor, UserRole.admin)
  async create(
    @Body() createChallengeDto: CreateChallengeDto,
    @CurrentUser() user: any,
  ) {
    return this.challengesService.create(createChallengeDto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChallengeDto: Partial<CreateChallengeDto>,
    @CurrentUser() user: any,
  ) {
    return this.challengesService.update(id, updateChallengeDto, user.id, user.role);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.challengesService.remove(id, user.id, user.role);
  }

  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  async submit(
    @Param('id') id: string,
    @Body() submitChallengeDto: SubmitChallengeDto,
    @CurrentUser() user: any,
  ) {
    return this.challengesService.submit(id, submitChallengeDto, user.id);
  }

  @Get(':id/submissions')
  async getSubmissions(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.challengesService.getSubmissions(id, user.id);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string) {
    return this.challengesService.getLeaderboard(id);
  }
}

