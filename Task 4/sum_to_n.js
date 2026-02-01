function sum_to_n_a(n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}

function sum_to_n_b(n) {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}


function sum_to_n_c(n) {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
}


console.log("sum_to_n_a(5):", sum_to_n_a(5)); // Expected: 15
console.log("sum_to_n_b(5):", sum_to_n_b(5)); // Expected: 15
console.log("sum_to_n_c(5):", sum_to_n_c(5)); // Expected: 15

console.log("\nsum_to_n_a(10):", sum_to_n_a(10)); // Expected: 55
console.log("sum_to_n_b(10):", sum_to_n_b(10)); // Expected: 55
console.log("sum_to_n_c(10):", sum_to_n_c(10)); // Expected: 55

console.log("\nsum_to_n_a(0):", sum_to_n_a(0)); // Expected: 0
console.log("sum_to_n_b(-5):", sum_to_n_b(-5)); // Expected: 0

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
