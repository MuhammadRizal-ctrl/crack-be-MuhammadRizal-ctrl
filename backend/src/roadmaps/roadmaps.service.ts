import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class RoadmapsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
    isPublished?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (category) where.category = category;
    if (isPublished !== undefined) where.isPublished = isPublished;

    const [roadmaps, total] = await Promise.all([
      this.prisma.roadmap.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.roadmap.count({ where }),
    ]);

    return {
      roadmaps,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    if (!roadmap) {
      throw new NotFoundException('Roadmap not found');
    }

    return roadmap;
  }

  async create(createRoadmapDto: CreateRoadmapDto, userId: string) {
    const roadmap = await this.prisma.roadmap.create({
      data: {
        ...createRoadmapDto,
        createdBy: userId,
        items: createRoadmapDto.items,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return roadmap;
  }

  async update(
    id: string,
    updateRoadmapDto: Partial<CreateRoadmapDto>,
    userId: string,
    userRole: UserRole,
  ) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id },
    });

    if (!roadmap) {
      throw new NotFoundException('Roadmap not found');
    }

    // Only creator or admin can update
    if (roadmap.createdBy !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own roadmaps');
    }

    const updatedRoadmap = await this.prisma.roadmap.update({
      where: { id },
      data: updateRoadmapDto,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return updatedRoadmap;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id },
    });

    if (!roadmap) {
      throw new NotFoundException('Roadmap not found');
    }

    // Only creator or admin can delete
    if (roadmap.createdBy !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own roadmaps');
    }

    await this.prisma.roadmap.delete({
      where: { id },
    });

    return { message: 'Roadmap deleted successfully' };
  }

  async enroll(roadmapId: string, userId: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
    });

    if (!roadmap) {
      throw new NotFoundException('Roadmap not found');
    }

    // Check if already enrolled
    const existingProgress = await this.prisma.userRoadmapProgress.findUnique({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
    });

    if (existingProgress) {
      throw new ConflictException('Already enrolled in this roadmap');
    }

    const progress = await this.prisma.userRoadmapProgress.create({
      data: {
        userId,
        roadmapId,
        completedItems: [],
        progress: 0,
      },
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return progress;
  }

  async getProgress(roadmapId: string, userId: string) {
    const progress = await this.prisma.userRoadmapProgress.findUnique({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
      include: {
        roadmap: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Not enrolled in this roadmap');
    }

    return progress;
  }

  async completeItem(roadmapId: string, itemId: string, userId: string) {
    const progress = await this.prisma.userRoadmapProgress.findUnique({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
      include: {
        roadmap: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Not enrolled in this roadmap');
    }

    const completedItems = progress.completedItems as string[];
    
    if (!completedItems.includes(itemId)) {
      completedItems.push(itemId);
    }

    // Calculate progress percentage
    const totalItems = (progress.roadmap.items as any[]).length;
    const newProgress = Math.round((completedItems.length / totalItems) * 100);

    const updatedProgress = await this.prisma.userRoadmapProgress.update({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
      data: {
        completedItems,
        progress: newProgress,
        completedAt: newProgress === 100 ? new Date() : null,
      },
    });

    return updatedProgress;
  }
}

