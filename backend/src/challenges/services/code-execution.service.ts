import { Injectable, Logger } from '@nestjs/common';
import { SubmissionStatus } from '@prisma/client';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface ExecutionResult {
  passed: boolean;
  actualOutput?: string;
  error?: string;
  executionTime?: number;
}

@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);

  /**
   * Execute code and run test cases
   * In production, this would use a sandboxed execution environment
   * For now, this is a mock implementation
   */
  async executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
  ): Promise<{
    status: SubmissionStatus;
    executionTime: number;
    memoryUsed: number;
    testResults: ExecutionResult[];
  }> {
    this.logger.log(`Executing ${language} code with ${testCases.length} test cases`);

    // TODO: Implement actual code execution
    // Options:
    // 1. Use Docker containers for sandboxed execution
    // 2. Use a code execution API (Judge0, Piston, etc.)
    // 3. Use a queue system (Bull/BullMQ) for async execution

    // Mock implementation for now
    const testResults: ExecutionResult[] = [];
    let allPassed = true;
    const startTime = Date.now();

    for (const testCase of testCases) {
      try {
        // Simulate code execution
        const result = await this.simulateExecution(code, language, testCase);
        testResults.push(result);
        if (!result.passed) {
          allPassed = false;
        }
      } catch (error) {
        testResults.push({
          passed: false,
          error: error.message,
        });
        allPassed = false;
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      status: allPassed ? SubmissionStatus.passed : SubmissionStatus.failed,
      executionTime,
      memoryUsed: Math.floor(Math.random() * 50) + 10, // Mock memory usage
      testResults,
    };
  }

  /**
   * Simulate code execution (mock implementation)
   * Replace this with actual execution logic
   */
  private async simulateExecution(
    code: string,
    language: string,
    testCase: TestCase,
  ): Promise<ExecutionResult> {
    // Simple mock: check if code contains expected output
    // In production, this would actually execute the code
    const expectedInCode = code.includes(testCase.expectedOutput) || 
                          code.includes('reverse') || 
                          code.includes('split');

    return {
      passed: expectedInCode || Math.random() > 0.3, // 70% pass rate for demo
      actualOutput: testCase.expectedOutput, // Mock output
      executionTime: Math.floor(Math.random() * 100) + 10,
    };
  }

  /**
   * Validate code syntax (basic validation)
   */
  validateSyntax(code: string, language: string): { valid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { valid: false, error: 'Code cannot be empty' };
    }

    // Basic language-specific validations
    switch (language.toLowerCase()) {
      case 'javascript':
        if (!code.includes('function') && !code.includes('=>') && !code.includes('const') && !code.includes('let')) {
          return { valid: false, error: 'Invalid JavaScript syntax' };
        }
        break;
      case 'python':
        if (!code.includes('def') && !code.includes('lambda')) {
          return { valid: false, error: 'Invalid Python syntax' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Sanitize code to prevent security issues
   */
  sanitizeCode(code: string): string {
    // Remove potentially dangerous patterns
    const dangerousPatterns = [
      /require\s*\(/gi,
      /import\s+/gi,
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /__import__/gi,
      /subprocess/gi,
      /process\./gi,
      /child_process/gi,
    ];

    let sanitized = code;
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        throw new Error('Code contains potentially dangerous operations');
      }
    }

    return sanitized;
  }
}

