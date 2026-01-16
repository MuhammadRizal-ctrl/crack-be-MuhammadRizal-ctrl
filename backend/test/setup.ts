import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupTestDatabase() {
  // Clean database before tests
  await prisma.tutorMessage.deleteMany();
  await prisma.tutorConversation.deleteMany();
  await prisma.userRoadmapProgress.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}

export async function teardownTestDatabase() {
  await prisma.$disconnect();
}

