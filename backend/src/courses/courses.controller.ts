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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('difficulty') difficulty?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.coursesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      difficulty,
      category,
      status,
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.instructor, UserRole.admin)
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.create(createCourseDto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.update(id, updateCourseDto, user.id, user.role);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.remove(id, user.id, user.role);
  }

  @Post(':id/enroll')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  async enroll(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.enroll(id, user.id);
  }

  @Delete(':id/unenroll')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  async unenroll(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.unenroll(id, user.id);
  }

  @Get(':id/modules')
  async getModules(@Param('id') id: string) {
    return this.coursesService.getModules(id);
  }

  @Get(':id/progress')
  @UseGuards(RolesGuard)
  @Roles(UserRole.student)
  async getProgress(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.getProgress(id, user.id);
  }
}

