import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
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

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  console.log('👥 Creating users...');
  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      passwordHash: hashedPassword,
      fullName: 'John Student',
      role: 'student',
      bio: 'Passionate learner exploring web development',
      timezone: 'UTC',
      language: 'en',
      isActive: true,
      emailVerified: true,
    },
  });

  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@example.com',
      passwordHash: hashedPassword,
      fullName: 'Jane Instructor',
      role: 'instructor',
      bio: 'Experienced full-stack developer and educator',
      timezone: 'UTC',
      language: 'en',
      isActive: true,
      emailVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      fullName: 'Admin User',
      role: 'admin',
      bio: 'System administrator',
      timezone: 'UTC',
      language: 'en',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create Courses
  console.log('📚 Creating courses...');
  const reactCourse = await prisma.course.create({
    data: {
      title: 'React Fundamentals',
      description: 'Learn the fundamentals of React including components, props, state, and hooks.',
      instructorId: instructor.id,
      difficulty: 'beginner',
      category: 'Web Development',
      duration: 20,
      status: 'published',
      prerequisites: [],
    },
  });

  const jsCourse = await prisma.course.create({
    data: {
      title: 'JavaScript Advanced',
      description: 'Master advanced JavaScript concepts including closures, async/await, and design patterns.',
      instructorId: instructor.id,
      difficulty: 'intermediate',
      category: 'Web Development',
      duration: 30,
      status: 'published',
      prerequisites: [],
    },
  });

  const nodeCourse = await prisma.course.create({
    data: {
      title: 'Node.js Advanced',
      description: 'Build scalable backend applications with Node.js.',
      instructorId: instructor.id,
      difficulty: 'advanced',
      category: 'Backend Development',
      duration: 40,
      status: 'published',
      prerequisites: [jsCourse.id],
    },
  });

  // Create Modules
  console.log('📑 Creating modules...');
  const reactModule1 = await prisma.module.create({
    data: {
      courseId: reactCourse.id,
      title: 'Introduction to React',
      description: 'Get started with React basics',
      orderIndex: 1,
      duration: 60,
    },
  });

  const reactModule2 = await prisma.module.create({
    data: {
      courseId: reactCourse.id,
      title: 'Components and Props',
      description: 'Learn about React components',
      orderIndex: 2,
      duration: 90,
    },
  });

  const jsModule1 = await prisma.module.create({
    data: {
      courseId: jsCourse.id,
      title: 'Advanced Concepts',
      description: 'Deep dive into JavaScript',
      orderIndex: 1,
      duration: 120,
    },
  });

  // Create Lessons
  console.log('📖 Creating lessons...');
  await prisma.lesson.create({
    data: {
      moduleId: reactModule1.id,
      title: 'What is React?',
      content: 'React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Facebook and the community.',
      orderIndex: 1,
      duration: 15,
      isFree: true,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: reactModule1.id,
      title: 'Setting up React',
      content: 'Learn how to set up a React project using Create React App or Vite.',
      orderIndex: 2,
      duration: 20,
      isFree: false,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: reactModule2.id,
      title: 'Understanding Components',
      content: 'Components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.',
      orderIndex: 1,
      duration: 25,
      isFree: false,
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: jsModule1.id,
      title: 'Closures and Scope',
      content: 'Understanding closures and lexical scope in JavaScript is crucial for advanced programming.',
      orderIndex: 1,
      duration: 30,
      isFree: false,
    },
  });

  // Create Enrollments
  console.log('🎓 Creating enrollments...');
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: reactCourse.id,
      status: 'active',
      progress: 45,
      enrolledAt: new Date('2024-01-15'),
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: jsCourse.id,
      status: 'active',
      progress: 20,
      enrolledAt: new Date('2024-01-16'),
    },
  });

  // Create Challenges
  console.log('💻 Creating challenges...');
  const challenge1 = await prisma.challenge.create({
    data: {
      title: 'Reverse a String',
      description: 'Write a function that reverses a string. For example, "hello" should become "olleh".',
      difficulty: 'easy',
      language: 'javascript',
      starterCode: 'function reverseString(str) {\n  // Your code here\n}',
      solution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
      testCases: [
        {
          input: '"hello"',
          expectedOutput: '"olleh"',
          isPublic: true,
        },
        {
          input: '"world"',
          expectedOutput: '"dlrow"',
          isPublic: true,
        },
        {
          input: '""',
          expectedOutput: '""',
          isPublic: false,
        },
      ],
      tags: ['strings', 'algorithms'],
      points: 10,
      timeLimit: 30,
      memoryLimit: 128,
      createdBy: instructor.id,
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'Two Sum',
      description: 'Given an array of integers and a target sum, find two numbers that add up to the target.',
      difficulty: 'medium',
      language: 'javascript',
      starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
      solution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      testCases: [
        {
          input: '[2, 7, 11, 15], 9',
          expectedOutput: '[0, 1]',
          isPublic: true,
        },
        {
          input: '[3, 2, 4], 6',
          expectedOutput: '[1, 2]',
          isPublic: true,
        },
      ],
      tags: ['arrays', 'hash-table'],
      points: 20,
      timeLimit: 60,
      memoryLimit: 256,
      createdBy: instructor.id,
    },
  });

  // Create Submissions
  console.log('📝 Creating submissions...');
  await prisma.submission.create({
    data: {
      challengeId: challenge1.id,
      userId: student.id,
      code: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
      language: 'javascript',
      status: 'passed',
      executionTime: 5,
      memoryUsed: 10,
      testResults: [
        {
          testCase: 1,
          passed: true,
          input: '"hello"',
          expectedOutput: '"olleh"',
          actualOutput: '"olleh"',
        },
        {
          testCase: 2,
          passed: true,
          input: '"world"',
          expectedOutput: '"dlrow"',
          actualOutput: '"dlrow"',
        },
      ],
      submittedAt: new Date('2024-01-20'),
    },
  });

  // Create Roadmaps
  console.log('🗺️  Creating roadmaps...');
  const frontendRoadmap = await prisma.roadmap.create({
    data: {
      title: 'Frontend Developer Roadmap',
      description: 'A comprehensive path to becoming a frontend developer.',
      category: 'Frontend',
      difficulty: 'beginner',
      estimatedDuration: 12,
      items: [
        {
          id: 'ri1',
          title: 'HTML Basics',
          type: 'milestone',
          order: 1,
          prerequisites: [],
          aiConceptExplanation: 'HTML is the foundation of web development. It provides the structure for web pages.',
          learningObjectives: [
            'Understand HTML structure',
            'Learn semantic HTML',
            'Master forms and inputs',
          ],
          references: [
            {
              type: 'documentation',
              title: 'MDN HTML Guide',
              url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
            },
          ],
        },
        {
          id: 'ri2',
          title: 'CSS Fundamentals',
          type: 'milestone',
          order: 2,
          prerequisites: ['ri1'],
          aiConceptExplanation: 'CSS allows you to style your HTML and create beautiful, responsive layouts.',
          learningObjectives: [
            'Learn CSS selectors',
            'Understand layout (Flexbox, Grid)',
            'Master responsive design',
          ],
        },
        {
          id: 'ri3',
          title: 'JavaScript Basics',
          type: 'course',
          order: 3,
          prerequisites: ['ri2'],
          linkedCourseIds: [jsCourse.id],
        },
        {
          id: 'ri4',
          title: 'React Fundamentals',
          type: 'course',
          order: 4,
          prerequisites: ['ri3'],
          linkedCourseIds: [reactCourse.id],
        },
      ],
      createdBy: instructor.id,
      isPublished: true,
    },
  });

  // Create Roadmap Progress
  console.log('📊 Creating roadmap progress...');
  await prisma.userRoadmapProgress.create({
    data: {
      userId: student.id,
      roadmapId: frontendRoadmap.id,
      completedItems: ['ri1', 'ri2'],
      progress: 50,
      startedAt: new Date('2024-01-10'),
    },
  });

  // Create AI Tutor Conversations
  console.log('🤖 Creating AI tutor conversations...');
  const conversation = await prisma.tutorConversation.create({
    data: {
      userId: student.id,
      title: 'Understanding React Hooks',
      personality: 'teacher',
      context: {
        courseId: reactCourse.id,
      },
    },
  });

  await prisma.tutorMessage.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: 'user',
        content: 'What are React hooks?',
        timestamp: new Date('2024-01-18T10:00:00Z'),
      },
      {
        conversationId: conversation.id,
        role: 'assistant',
        content: 'React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 to allow you to use state and other React features without writing a class.',
        timestamp: new Date('2024-01-18T10:00:30Z'),
      },
      {
        conversationId: conversation.id,
        role: 'user',
        content: 'Can you give me an example of useState?',
        timestamp: new Date('2024-01-18T10:01:00Z'),
      },
      {
        conversationId: conversation.id,
        role: 'assistant',
        content: 'Sure! Here\'s a simple example:\n\n```javascript\nimport { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\n`useState` returns an array with two elements: the current state value and a function to update it.',
        timestamp: new Date('2024-01-18T10:01:30Z'),
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - Users: 3 (student, instructor, admin)`);
  console.log(`   - Courses: 3`);
  console.log(`   - Modules: 3`);
  console.log(`   - Lessons: 4`);
  console.log(`   - Enrollments: 2`);
  console.log(`   - Challenges: 2`);
  console.log(`   - Submissions: 1`);
  console.log(`   - Roadmaps: 1`);
  console.log(`   - Roadmap Progress: 1`);
  console.log(`   - Tutor Conversations: 1`);
  console.log(`   - Tutor Messages: 4`);
  console.log('\n🔑 Login credentials:');
  console.log('   Student: student@example.com / password123');
  console.log('   Instructor: instructor@example.com / password123');
  console.log('   Admin: admin@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

