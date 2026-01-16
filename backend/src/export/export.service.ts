import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportUsersToCSV(role?: UserRole): Promise<string> {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // CSV header
    const headers = ['ID', 'Email', 'Full Name', 'Role', 'Email Verified', 'Created At'];
    const rows = users.map((user) => [
      user.id,
      user.email,
      user.fullName,
      user.role,
      user.emailVerified ? 'Yes' : 'No',
      user.createdAt.toISOString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  async exportCoursesToCSV(): Promise<string> {
    const courses = await this.prisma.course.findMany({
      include: {
        instructor: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });

    const headers = ['ID', 'Title', 'Instructor', 'Difficulty', 'Status', 'Enrollments', 'Modules', 'Created At'];
    const rows = courses.map((course) => [
      course.id,
      course.title,
      course.instructor.fullName,
      course.difficulty,
      course.status,
      course._count.enrollments.toString(),
      course._count.modules.toString(),
      course.createdAt.toISOString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  async exportChallengesToCSV(): Promise<string> {
    const challenges = await this.prisma.challenge.findMany({
      include: {
        creator: {
          select: {
            fullName: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    const headers = ['ID', 'Title', 'Difficulty', 'Language', 'Creator', 'Submissions', 'Created At'];
    const rows = challenges.map((challenge) => [
      challenge.id,
      challenge.title,
      challenge.difficulty,
      challenge.language,
      challenge.creator.fullName,
      challenge._count.submissions.toString(),
      challenge.createdAt.toISOString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  private arrayToCSV(data: string[][]): string {
    return data
      .map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or newline
            const escaped = String(cell).replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
              return `"${escaped}"`;
            }
            return escaped;
          })
          .join(','),
      )
      .join('\n');
  }
}

