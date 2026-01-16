import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    difficulty?: string,
    category?: string,
    status?: string,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;
    if (status) where.status = status;

    // Full-text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses: courses.map((course) => ({
        ...course,
        enrollmentCount: course._count.enrollments,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      ...course,
      enrollmentCount: course._count.enrollments,
    };
  }

  async create(createCourseDto: CreateCourseDto, userId: string) {
    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        instructorId: userId,
        prerequisites: createCourseDto.prerequisites || [],
      },
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    userId: string,
    userRole: UserRole,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only instructor/owner or admin can update
    if (course.instructorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own courses');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return updatedCourse;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only instructor/owner or admin can delete
    if (course.instructorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return { message: 'Course deleted successfully' };
  }

  async enroll(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'active',
        progress: 0,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Create notification for enrollment
    this.notificationsService
      .notifyCourseEnrollment(userId, enrollment.course.title, courseId)
      .catch((err) => {
        console.error('Failed to create enrollment notification:', err);
      });

    return enrollment;
  }

  async unenroll(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return { message: 'Unenrolled successfully' };
  }

  async getModules(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course.modules;
  }

  async getProgress(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Not enrolled in this course');
    }

    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );

    // Check if course is completed (progress = 100%)
    if (enrollment.progress === 100 && enrollment.status !== 'completed') {
      // Update enrollment status to completed
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // Create completion notification
      this.notificationsService
        .notifyCourseCompleted(userId, enrollment.course.title, courseId)
        .catch((err) => {
          console.error('Failed to create completion notification:', err);
        });
    }

    return {
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      status: enrollment.status,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      totalLessons,
    };
  }
}

