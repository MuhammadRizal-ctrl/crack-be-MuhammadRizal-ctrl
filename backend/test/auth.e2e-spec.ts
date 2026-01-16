import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let instructorToken: string;
  let adminToken: string;

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

    // Clean database
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

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        email: 'student@test.com',
        passwordHash: hashedPassword,
        fullName: 'Test Student',
        role: 'student',
      },
    });

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
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        fullName: 'Test Admin',
        role: 'admin',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          fullName: 'New User',
          role: 'student',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe('newuser@test.com');
        });
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          fullName: 'Duplicate User',
          role: 'student',
        })
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          fullName: 'Duplicate User',
          role: 'student',
        })
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          fullName: 'Invalid User',
          role: 'student',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'shortpass@test.com',
          password: '12345',
          fullName: 'Short Pass',
          role: 'student',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe('student@test.com');
          studentToken = res.body.token;
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should get current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe('student@test.com');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123',
        });
      refreshToken = loginRes.body.refreshToken;
    });

    it('should refresh access token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });
});

