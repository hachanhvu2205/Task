/**
 * Test Suite for sum_to_n implementations
 * 
 * This file contains comprehensive tests for all three implementations
 * of the sum_to_n function to ensure correctness and consistency.
 */

import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './problem4';

// Helper function to calculate expected sum for verification
const expectedSum = (n: number): number => {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

describe('sum_to_n implementations', () => {
    // ========================================================================
    // Test all implementations with the same test cases
    // ========================================================================
    
    const implementations = [
        { name: 'sum_to_n_a (Mathematical Formula)', fn: sum_to_n_a },
        { name: 'sum_to_n_b (Iterative Loop)', fn: sum_to_n_b },
        { name: 'sum_to_n_c (Recursive)', fn: sum_to_n_c },
    ];

    implementations.forEach(({ name, fn }) => {
        describe(name, () => {
            // ----------------------------------------------------------------
            // Basic functionality tests
            // ----------------------------------------------------------------
            describe('basic functionality', () => {
                test('sum_to_n(5) should return 15', () => {
                    expect(fn(5)).toBe(15);
                });

                test('sum_to_n(10) should return 55', () => {
                    expect(fn(10)).toBe(55);
                });

                test('sum_to_n(1) should return 1', () => {
                    expect(fn(1)).toBe(1);
                });

                test('sum_to_n(100) should return 5050', () => {
                    expect(fn(100)).toBe(5050);
                });
            });

            // ----------------------------------------------------------------
            // Edge cases
            // ----------------------------------------------------------------
            describe('edge cases', () => {
                test('sum_to_n(0) should return 0', () => {
                    expect(fn(0)).toBe(0);
                });

                test('sum_to_n(-1) should return 0', () => {
                    expect(fn(-1)).toBe(0);
                });

                test('sum_to_n(-100) should return 0', () => {
                    expect(fn(-100)).toBe(0);
                });
            });

        });
    });

    // ========================================================================
    // Cross-implementation consistency tests
    // ========================================================================
    describe('cross-implementation consistency', () => {
        const testCases = [1, 2, 5, 10, 50, 100, 500, 1000];

        testCases.forEach(n => {
            test(`all implementations should return same result for n=${n}`, () => {
                const resultA = sum_to_n_a(n);
                const resultB = sum_to_n_b(n);
                const resultC = sum_to_n_c(n);

                expect(resultA).toBe(resultB);
                expect(resultB).toBe(resultC);
                expect(resultA).toBe(expectedSum(n));
            });
        });
    });

    // ========================================================================
    // Property-based tests
    // ========================================================================
    describe('mathematical properties', () => {
        test('sum_to_n(n) should equal sum_to_n(n-1) + n', () => {
            for (let n = 2; n <= 100; n++) {
                expect(sum_to_n_a(n)).toBe(sum_to_n_a(n - 1) + n);
                expect(sum_to_n_b(n)).toBe(sum_to_n_b(n - 1) + n);
            }
        });

        test('sum should always be non-negative for positive n', () => {
            for (let n = 1; n <= 100; n++) {
                expect(sum_to_n_a(n)).toBeGreaterThan(0);
                expect(sum_to_n_b(n)).toBeGreaterThan(0);
                expect(sum_to_n_c(n)).toBeGreaterThan(0);
            }
        });

        test('sum should increase monotonically for positive n', () => {
            let prevSum = 0;
            for (let n = 1; n <= 100; n++) {
                const currentSum = sum_to_n_a(n);
                expect(currentSum).toBeGreaterThan(prevSum);
                prevSum = currentSum;
            }
        });
    });

    // ========================================================================
    // Type safety tests (TypeScript specific)
    // ========================================================================
    describe('type safety', () => {
        test('should handle floating point by truncating behavior', () => {
            // Note: The function expects integer input per problem spec
            // These tests document behavior with non-integer input
            expect(sum_to_n_a(5.9)).toBe(expectedSum(5.9)); // Formula handles it
            expect(sum_to_n_b(5.9)).toBe(15); // Loop runs 5 times
        });
    });
});

// ============================================================================
// Performance comparison (informational, not assertions)
// ============================================================================
describe('performance comparison (informational)', () => {
    test('log performance for n=10000', () => {
        const n = 10000;
        
        const startA = performance.now();
        sum_to_n_a(n);
        const timeA = performance.now() - startA;

        const startB = performance.now();
        sum_to_n_b(n);
        const timeB = performance.now() - startB;

        // Note: We don't test recursive for large n due to stack limits
        
        console.log(`\nPerformance for n=${n}:`);
        console.log(`  sum_to_n_a (Formula):   ${timeA.toFixed(4)}ms`);
        console.log(`  sum_to_n_b (Iterative): ${timeB.toFixed(4)}ms`);
        
        // Formula should generally be faster or equal
        expect(timeA).toBeLessThanOrEqual(timeB + 1); // 1ms tolerance
    });
});
