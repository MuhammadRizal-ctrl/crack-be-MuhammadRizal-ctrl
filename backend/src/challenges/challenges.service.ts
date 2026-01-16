import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitChallengeDto } from './dto/submit-challenge.dto';
import { UserRole, SubmissionStatus } from '@prisma/client';
import { CodeExecutionService } from './services/code-execution.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChallengesService {
  constructor(
    private prisma: PrismaService,
    private codeExecutionService: CodeExecutionService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    difficulty?: string,
    language?: string,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (difficulty) where.difficulty = difficulty;
    if (language) where.language = language;

    // Full-text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [challenges, total] = await Promise.all([
      this.prisma.challenge.findMany({
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
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.challenge.count({ where }),
    ]);

    return {
      challenges: challenges.map((challenge) => ({
        ...challenge,
        submissionCount: challenge._count.submissions,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
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

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Don't return solution to non-creators
    const { solution, ...challengeWithoutSolution } = challenge;
    return challengeWithoutSolution;
  }

  async create(createChallengeDto: CreateChallengeDto, userId: string) {
    const challenge = await this.prisma.challenge.create({
      data: {
        ...createChallengeDto,
        createdBy: userId,
        tags: createChallengeDto.tags || [],
        testCases: createChallengeDto.testCases,
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

    return challenge;
  }

  async update(
    id: string,
    updateChallengeDto: Partial<CreateChallengeDto>,
    userId: string,
    userRole: UserRole,
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Only creator or admin can update
    if (challenge.createdBy !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own challenges');
    }

    const updatedChallenge = await this.prisma.challenge.update({
      where: { id },
      data: updateChallengeDto,
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

    return updatedChallenge;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Only creator or admin can delete
    if (challenge.createdBy !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own challenges');
    }

    await this.prisma.challenge.delete({
      where: { id },
    });

    return { message: 'Challenge deleted successfully' };
  }

  async submit(
    challengeId: string,
    submitChallengeDto: SubmitChallengeDto,
    userId: string,
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Validate and sanitize code
    const syntaxCheck = this.codeExecutionService.validateSyntax(
      submitChallengeDto.code,
      submitChallengeDto.language,
    );

    if (!syntaxCheck.valid) {
      throw new ForbiddenException(syntaxCheck.error);
    }

    try {
      const sanitizedCode = this.codeExecutionService.sanitizeCode(
        submitChallengeDto.code,
      );

      // Execute code and run tests
      const testCases = challenge.testCases as any[];
      const executionResult = await this.codeExecutionService.executeCode(
        sanitizedCode,
        submitChallengeDto.language,
        testCases,
      );

      // Create submission with results
      const submission = await this.prisma.submission.create({
        data: {
          challengeId,
          userId,
          code: sanitizedCode,
          language: submitChallengeDto.language,
          status: executionResult.status,
          executionTime: executionResult.executionTime,
          memoryUsed: executionResult.memoryUsed,
          testResults: executionResult.testResults as any,
        },
      });

      // Create notification for submission feedback
      this.notificationsService
        .notifyChallengeFeedback(
          userId,
          challenge.title,
          challengeId,
          executionResult.status === SubmissionStatus.passed,
        )
        .catch((err) => {
          console.error('Failed to create challenge notification:', err);
        });

      return {
        submission: {
          id: submission.id,
          status: submission.status,
          executionTime: submission.executionTime,
          memoryUsed: submission.memoryUsed,
          testResults: submission.testResults,
          submittedAt: submission.submittedAt,
        },
        message:
          executionResult.status === SubmissionStatus.passed
            ? 'All tests passed! 🎉'
            : 'Some tests failed. Try again!',
      };
    } catch (error) {
      // Create failed submission
      const submission = await this.prisma.submission.create({
        data: {
          challengeId,
          userId,
          code: submitChallengeDto.code,
          language: submitChallengeDto.language,
          status: SubmissionStatus.error,
          testResults: [{ error: error.message }],
        },
      });

      return {
        submission: {
          id: submission.id,
          status: submission.status,
          testResults: submission.testResults,
          submittedAt: submission.submittedAt,
        },
        message: `Execution error: ${error.message}`,
      };
    }
  }

  async getSubmissions(challengeId: string, userId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        challengeId,
        userId,
      },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        code: true,
        language: true,
        status: true,
        executionTime: true,
        memoryUsed: true,
        testResults: true,
        submittedAt: true,
      },
    });

    return submissions;
  }

  async getLeaderboard(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Get best submission for each user
    const submissions = await this.prisma.submission.findMany({
      where: {
        challengeId,
        status: 'passed',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { executionTime: 'asc' },
        { submittedAt: 'asc' },
      ],
      distinct: ['userId'],
      take: 100,
    });

    return submissions.map((submission, index) => ({
      rank: index + 1,
      user: submission.user,
      executionTime: submission.executionTime,
      memoryUsed: submission.memoryUsed,
      submittedAt: submission.submittedAt,
    }));
  }
}

