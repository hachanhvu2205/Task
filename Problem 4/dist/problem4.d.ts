/**
 * 99Tech Backend Problem 4
 * Three unique implementations of sum_to_n function
 *
 * Task: Provide 3 unique implementations that calculate the summation from 1 to n
 * Example: sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 *
 * Assumption: Input will always produce a result lesser than Number.MAX_SAFE_INTEGER
 */
/**
 * Implementation A: Mathematical Formula (Gauss's Formula)
 *
 * Uses the well-known arithmetic series formula: n * (n + 1) / 2
 *
 * This formula was famously discovered by Carl Friedrich Gauss as a child
 * when asked to sum numbers from 1 to 100.
 *
 * Time Complexity: O(1) - Constant time, only performs 3 arithmetic operations
 * Space Complexity: O(1) - No additional memory allocation required
 *
 * Pros:
 * - Most efficient solution possible
 * - No risk of stack overflow
 * - Performance independent of input size
 *
 * Cons:
 * - Requires knowledge of the mathematical formula
 * - Less intuitive for those unfamiliar with the formula
 *
 * @param n - The upper bound of the summation (inclusive)
 * @returns The sum of all integers from 1 to n, or 0 if n <= 0
 */
export declare function sum_to_n_a(n: number): number;
/**
 * Implementation B: Iterative Approach (For Loop)
 *
 * Accumulates the sum by iterating through each number from 1 to n
 * and adding it to a running total.
 *
 * Time Complexity: O(n) - Linear time, performs n iterations
 * Space Complexity: O(1) - Only uses a single accumulator variable
 *
 * Pros:
 * - Simple and intuitive to understand
 * - No risk of stack overflow
 * - Easy to debug and trace
 *
 * Cons:
 * - Slower than the mathematical formula for large n
 * - Performance degrades linearly with input size
 *
 * @param n - The upper bound of the summation (inclusive)
 * @returns The sum of all integers from 1 to n, or 0 if n <= 0
 */
export declare function sum_to_n_b(n: number): number;
/**
 * Implementation C: Recursive Approach
 *
 * Recursively calculates the sum by adding n to the sum of (1 to n-1).
 * Base case: when n <= 0, return 0.
 *
 * This approach directly mirrors the mathematical definition:
 * sum(n) = n + sum(n-1), where sum(0) = 0
 *
 * Time Complexity: O(n) - Makes n recursive calls
 * Space Complexity: O(n) - Call stack grows linearly with n
 *
 * Pros:
 * - Elegant and mirrors the mathematical definition
 * - Demonstrates understanding of recursion
 * - Clean and minimal code
 *
 * Cons:
 * - Risk of stack overflow for very large n (typically > 10,000)
 * - Higher memory usage due to call stack
 * - Slower due to function call overhead
 *
 * @param n - The upper bound of the summation (inclusive)
 * @returns The sum of all integers from 1 to n, or 0 if n <= 0
 */
export declare function sum_to_n_c(n: number): number;
//# sourceMappingURL=problem4.d.ts.map