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
 * @param n - The upper bound of the summation (inclusive)
 * @returns The sum of all integers from 1 to n, or 0 if n <= 0
 */
export function sum_to_n_a(n: number): number {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}

/**
 * Implementation B: Iterative Approach (For Loop)
 * 
 * Accumulates the sum by iterating through each number from 1 to n
 * and adding it to a running total.
 * 
 * Time Complexity: O(n) - Linear time, performs n iterations
 * Space Complexity: O(1) - Only uses a single accumulator variable
 * 
 * @param n - The upper bound of the summation (inclusive)
 * @returns The sum of all integers from 1 to n, or 0 if n <= 0
 */
export function sum_to_n_b(n: number): number {
    if (n <= 0) return 0;
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

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
 * @param n - The upper bound of the summation (inclusive)
 * @returns The sum of all integers from 1 to n, or 0 if n <= 0
 */
export function sum_to_n_c(n: number): number {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
}

// ============================================================================
// Demo execution when run directly
// ============================================================================

if (require.main === module) {
    console.log("=".repeat(60));
    console.log("99Tech Backend Problem 4 - Three Implementations of sum_to_n");
    console.log("=".repeat(60));
    
    const testValues = [5, 10, 100, 0, -5];
    
    testValues.forEach(n => {
        console.log(`\nTesting n = ${n}:`);
        console.log(`  sum_to_n_a(${n}) = ${sum_to_n_a(n)} (Mathematical Formula)`);
        console.log(`  sum_to_n_b(${n}) = ${sum_to_n_b(n)} (Iterative Loop)`);
        console.log(`  sum_to_n_c(${n}) = ${sum_to_n_c(n)} (Recursive)`);
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("Complexity Analysis:");
    console.log("=".repeat(60));
    console.log(`
| Implementation | Time     | Space    | Best For                    |
|---------------|----------|----------|----------------------------|
| A (Formula)   | O(1)     | O(1)     | Production, large inputs   |
| B (Iterative) | O(n)     | O(1)     | Simplicity, readability    |
| C (Recursive) | O(n)     | O(n)     | Educational, small inputs  |
`);
}
