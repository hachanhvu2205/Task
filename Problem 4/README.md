# 99Tech Backend Problem 4

Three unique TypeScript implementations to calculate the sum of the first n natural numbers.

## Problem Statement

**Input**: `n` - any integer  
**Output**: Summation from 1 to n, i.e., `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`

*Assumption: Input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*

## Quick Start

```bash
# Clone the repository
git clone https://github.com/hachanhvu2205/Task.git
cd Task

# Install dependencies
npm install

# Run the code
npm start

# Run tests
npm test
```

## Implementations

### Implementation A: Mathematical Formula (Gauss's Formula)

```typescript
function sum_to_n_a(n: number): number {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}
```

**Complexity:**
- Time: `O(1)` - Constant time
- Space: `O(1)` - No additional memory

**Analysis:** This is the most efficient approach, using the well-known arithmetic series formula discovered by Carl Friedrich Gauss. It performs only 3 arithmetic operations regardless of input size.

---

### Implementation B: Iterative Loop

```typescript
function sum_to_n_b(n: number): number {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
```

**Complexity:**
- Time: `O(n)` - Linear time
- Space: `O(1)` - Single accumulator variable

**Analysis:** Simple and intuitive approach that accumulates the sum through iteration. Easy to understand and debug, but performance degrades linearly with input size.

---

### Implementation C: Recursive Approach

```typescript
function sum_to_n_c(n: number): number {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
}
```

**Complexity:**
- Time: `O(n)` - n recursive calls
- Space: `O(n)` - Call stack grows linearly

**Analysis:** Elegant solution that mirrors the mathematical definition. However, it has risk of stack overflow for very large n (typically > 10,000) and higher memory usage due to the call stack.

---

## Complexity Comparison

| Implementation | Time | Space | Pros | Cons |
|---------------|------|-------|------|------|
| A (Formula) | O(1) | O(1) | Fastest, most efficient | Requires knowing formula |
| B (Iterative) | O(n) | O(1) | Simple, no stack risk | Slower for large n |
| C (Recursive) | O(n) | O(n) | Elegant, mirrors math | Stack overflow risk |

## Testing

The project includes comprehensive tests covering:

- ✅ Basic functionality
- ✅ Edge cases (0, negative numbers)
- ✅ Large values
- ✅ Cross-implementation consistency
- ✅ Mathematical properties
- ✅ Performance comparison

```bash
# Run all tests
npm test

# Run tests with coverage
npm test:coverage
```

## Project Structure

```
.
├── src/
│   ├── problem4.ts       # Main implementations
│   └── problem4.test.ts  # Test suite
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Requirements

- Node.js (v16+)
- npm

## License

ISC
