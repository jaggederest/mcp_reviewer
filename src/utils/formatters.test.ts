import { describe, it, expect } from 'vitest';
import { 
  formatSections, 
  formatStatus, 
  formatExecOutput, 
  formatExecOutputFull,
  formatExecResult 
} from './formatters.js';

describe('formatters', () => {
  describe('formatSections', () => {
    it('should format sections with appropriate emojis', () => {
      const sections = [
        { title: 'Build', content: 'Success', type: 'success' as const },
        { title: 'Tests', content: 'Failed\non line 5', type: 'error' as const },
        { title: 'Warning', content: 'Deprecated API', type: 'warning' as const },
      ];
      
      const result = formatSections(sections);
      
      expect(result).toBe('✅ Build: Success | ❌ Tests: Failed on line 5 | ⚠️ Warning: Deprecated API');
    });
    
    it('should handle sections without type', () => {
      const sections = [{ title: 'Info', content: 'Some data' }];
      const result = formatSections(sections);
      expect(result).toBe('📋 Info: Some data');
    });
  });

  describe('formatStatus', () => {
    it('should format success status', () => {
      const result = formatStatus(0, 'All tests passed', 'Tests failed');
      expect(result).toBe('✅ PASSED: All tests passed');
    });
    
    it('should format failure status', () => {
      const result = formatStatus(1, 'All tests passed', 'Tests failed');
      expect(result).toBe('❌ FAILED: Tests failed');
    });
  });

  describe('formatExecOutput', () => {
    it('should format successful execution with output', () => {
      const result = formatExecOutput('Test output\nSecond line', '', 0, 'Tests');
      expect(result).toBe('✅ Tests: Success | Test output');
    });
    
    it('should truncate long output lines', () => {
      const longOutput = 'a'.repeat(100);
      const result = formatExecOutput(longOutput, '', 0, 'Tests');
      expect(result).toBe(`✅ Tests: Success | ${'a'.repeat(77)}...`);
    });
    
    it('should format failed execution with error', () => {
      const result = formatExecOutput('', 'Error: Test failed\nDetails here', 1, 'Tests');
      expect(result).toBe('❌ Tests: Failed (exit 1) | Error: Test failed');
    });
    
    it('should handle no output or error', () => {
      const result = formatExecOutput('', '', 2, 'Tests');
      expect(result).toBe('❌ Tests: Failed (exit 2)');
    });
  });

  describe('formatExecOutputFull', () => {
    it('should include full error output', () => {
      const error = 'Error: Test failed\nStack trace:\n  at file.js:10\n  at runner.js:20';
      const result = formatExecOutputFull('', error, 1, 'Tests');
      expect(result).toBe('❌ Tests: Failed (exit 1)\n\nError: Test failed\nStack trace:\n  at file.js:10\n  at runner.js:20');
    });
    
    it('should strip ANSI escape codes', () => {
      const errorWithAnsi = '\x1b[31mError: Test failed\x1b[0m';
      const result = formatExecOutputFull('', errorWithAnsi, 1, 'Tests');
      expect(result).toBe('❌ Tests: Failed (exit 1)\n\nError: Test failed');
    });
    
    it('should truncate very large output', () => {
      const hugeError = 'a'.repeat(200000); // 200KB
      const result = formatExecOutputFull('', hugeError, 1, 'Tests');
      
      // Should contain truncation message
      expect(result).toContain('[... truncated');
      expect(result).toContain('bytes ...]');
      
      // Should be less than max size (100KB + overhead)
      expect(result.length).toBeLessThan(110000);
    });
    
    it('should prefer stderr over stdout', () => {
      const result = formatExecOutputFull('stdout content', 'stderr content', 1, 'Tests');
      expect(result).toBe('❌ Tests: Failed (exit 1)\n\nstderr content');
    });
  });

  describe('formatExecResult', () => {
    it('should use formatExecOutput for success', () => {
      const result = formatExecResult('Success output', '', 0, 'Tests');
      expect(result).toBe('✅ Tests: Success | Success output');
    });
    
    it('should use formatExecOutputFull for failure', () => {
      const error = 'Error details\nLine 2\nLine 3';
      const result = formatExecResult('', error, 1, 'Tests');
      expect(result).toBe('❌ Tests: Failed (exit 1)\n\nError details\nLine 2\nLine 3');
    });
  });
});