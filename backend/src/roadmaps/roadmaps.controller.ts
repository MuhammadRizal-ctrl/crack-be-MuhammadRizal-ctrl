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
import { RoadmapsService } from './roadmaps.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    return this.roadmapsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      category,
      isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roadmapsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.instructor, UserRole.admin)
  async create(
    @Body() createRoadmapDto: CreateRoadmapDto,
    @CurrentUser() user: any,
  ) {
    return this.roadmapsService.create(createRoadmapDto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoadmapDto: Partial<CreateRoadmapDto>,
    @CurrentUser() user: any,
  ) {
    return this.roadmapsService.update(id, updateRoadmapDto, user.id, user.role);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.roadmapsService.remove(id, user.id, user.role);
  }

  @Post(':id/enroll')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  async enroll(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.roadmapsService.enroll(id, user.id);
  }

  @Get(':id/progress')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  async getProgress(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.roadmapsService.getProgress(id, user.id);
  }

  @Post(':id/items/:itemId/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  async completeItem(
    @Param('id') roadmapId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: any,
  ) {
    return this.roadmapsService.completeItem(roadmapId, itemId, user.id);
  }
}

