import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('CoursesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let instructorToken: string;
  let studentToken: string;
  let courseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    });
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean and setup
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

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    await prisma.user.create({
      data: {
        email: 'instructor@test.com',
        passwordHash: hashedPassword,
        fullName: 'Test Instructor',
        role: 'instructor',
      },
    });

    await prisma.user.create({
      data: {
        email: 'student@test.com',
        passwordHash: hashedPassword,
        fullName: 'Test Student',
        role: 'student',
      },
    });

    // Login to get tokens
    const instructorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'instructor@test.com', password: 'password123' });
    instructorToken = instructorLogin.body.token;

    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/courses (POST)', () => {
    it('should create a course as instructor', () => {
      return request(app.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Test Course',
          description: 'Test Description',
          difficulty: 'beginner',
          category: 'Web Development',
          duration: 20,
          status: 'published',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Course');
          courseId = res.body.id;
        });
    });

    it('should fail as student', () => {
      return request(app.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Test Course 2',
          description: 'Test Description',
          difficulty: 'beginner',
        })
        .expect(403);
    });
  });

  describe('/courses (GET)', () => {
    it('should list courses', () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('courses');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.courses)).toBe(true);
        });
    });

    it('should filter by difficulty', () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses?difficulty=beginner')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.courses.every((c: any) => c.difficulty === 'beginner')).toBe(true);
        });
    });
  });

  describe('/courses/:id (GET)', () => {
    it('should get course details', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('modules');
        });
    });

    it('should return 404 for non-existent course', () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses/non-existent-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('/courses/:id/enroll (POST)', () => {
    it('should enroll student in course', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('active');
        });
    });

    it('should fail to enroll twice', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(409);
    });

    it('should fail as instructor', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(403);
    });
  });

  describe('/courses/:id/progress (GET)', () => {
    it('should get course progress', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${courseId}/progress`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('progress');
          expect(res.body).toHaveProperty('enrollmentId');
        });
    });
  });
});

