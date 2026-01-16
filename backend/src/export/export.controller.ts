import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ExportService } from './export.service';
import { Response } from 'express';

@ApiTags('export')
@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
@ApiBearerAuth('JWT-auth')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('users/csv')
  @ApiOperation({ summary: 'Export users to CSV' })
  async exportUsersCSV(@Res({ passthrough: false }) res: any, @Query('role') role?: UserRole) {
    const csv = await this.exportService.exportUsersToCSV(role);
    const filename = `users-${role || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('courses/csv')
  @ApiOperation({ summary: 'Export courses to CSV' })
  async exportCoursesCSV(@Res({ passthrough: false }) res: any) {
    const csv = await this.exportService.exportCoursesToCSV();
    const filename = `courses-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('challenges/csv')
  @ApiOperation({ summary: 'Export challenges to CSV' })
  async exportChallengesCSV(@Res({ passthrough: false }) res: any) {
    const csv = await this.exportService.exportChallengesToCSV();
    const filename = `challenges-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}

