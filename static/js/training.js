const EXERCISES = {
    python: [
        {
            id: 1,
            title: "FizzBuzz",
            description: "Imprima números de 1 a 100. Múltiplos de 3 imprima 'Fizz', de 5 'Buzz', e de ambos 'FizzBuzz'",
            difficulty: "easy",
            starter: `def fizzbuzz(n):
    # Sua implementação aqui
    pass

# Teste
for i in range(1, 21):
    print(fizzbuzz(i))`,
            solution: `def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    else:
        return str(n)

for i in range(1, 21):
    print(fizzbuzz(i))`,
            testCases: [
                { input: 15, expected: "FizzBuzz" },
                { input: 9, expected: "Fizz" },
                { input: 10, expected: "Buzz" },
                { input: 7, expected: "7" }
            ]
        },
        {
            id: 2,
            title: "Palíndromo",
            description: "Verifique se uma string é um palíndromo (lê igual de trás pra frente)",
            difficulty: "easy",
            starter: `def is_palindrome(s):
    # Sua implementação aqui
    pass

# Teste
print(is_palindrome("radar"))  # True
print(is_palindrome("hello"))  # False`,
            solution: `def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

print(is_palindrome("radar"))
print(is_palindrome("hello"))`,
            testCases: [
                { input: "radar", expected: true },
                { input: "level", expected: true },
                { input: "hello", expected: false },
                { input: "A man a plan a canal Panama", expected: true }
            ]
        },
        {
            id: 3,
            title: "Fibonacci",
            description: "Retorne o n-ésimo número da sequência de Fibonacci",
            difficulty: "easy",
            starter: `def fibonacci(n):
    # Sua implementação aqui
    pass

# Teste
for i in range(1, 11):
    print(fibonacci(i))`,
            solution: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(1, 11):
    print(fibonacci(i))`,
            testCases: [
                { input: 1, expected: 1 },
                { input: 10, expected: 55 },
                { input: 15, expected: 610 }
            ]
        },
        {
            id: 4,
            title: "Fatorial",
            description: "Calcule o fatorial de um número (n!)",
            difficulty: "easy",
            starter: `def factorial(n):
    # Sua implementação aqui
    pass

# Teste
print(factorial(5))  # 120`,
            solution: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

print(factorial(5))`,
            testCases: [
                { input: 5, expected: 120 },
                { input: 0, expected: 1 },
                { input: 10, expected: 3628800 }
            ]
        },
        {
            id: 5,
            title: "Números Primos",
            description: "Verifique se um número é primo",
            difficulty: "easy",
            starter: `def is_prime(n):
    # Sua implementação aqui
    pass

# Teste
print(is_prime(17))  # True
print(is_prime(15))  # False`,
            solution: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(17))
print(is_prime(15))`,
            testCases: [
                { input: 17, expected: true },
                { input: 1, expected: false },
                { input: 2, expected: true },
                { input: 15, expected: false }
            ]
        },
        {
            id: 6,
            title: "Bubble Sort",
            description: "Implemente o algoritmo Bubble Sort para ordenar uma lista",
            difficulty: "medium",
            starter: `def bubble_sort(arr):
    # Sua implementação aqui
    pass

# Teste
print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))`,
            solution: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))`,
            testCases: [
                { input: [5, 2, 8, 1], expected: [1, 2, 5, 8] },
                { input: [3, 3, 3], expected: [3, 3, 3] }
            ]
        },
        {
            id: 7,
            title: "Busca Binária",
            description: "Implemente busca binária para encontrar um elemento em lista ordenada",
            difficulty: "medium",
            starter: `def binary_search(arr, target):
    # Sua implementação aqui
    pass

# Teste
arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7))   # 3
print(binary_search(arr, 6))   # -1`,
            solution: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7))
print(binary_search(arr, 6))`,
            testCases: [
                { input: [[1,3,5,7,9], 5], expected: 2 },
                { input: [[1,3,5,7,9], 6], expected: -1 }
            ]
        },
        {
            id: 8,
            title: "Reversão de String",
            description: "Inverta uma string sem usar funções built-in",
            difficulty: "easy",
            starter: `def reverse_string(s):
    # Sua implementação aqui
    pass

print(reverse_string("hello"))  # "olleh"`,
            solution: `def reverse_string(s):
    result = ""
    for char in s:
        result = char + result
    return result

print(reverse_string("hello"))`,
            testCases: [
                { input: "hello", expected: "olleh" },
                { input: "Python", expected: "nohtyP" }
            ]
        },
        {
            id: 9,
            title: "Contagem de Palavras",
            description: "Conte a frequência de cada palavra em uma string",
            difficulty: "medium",
            starter: `def word_count(s):
    # Sua implementação aqui
    pass

print(word_count("hello world hello"))`,
            solution: `def word_count(s):
    words = s.lower().split()
    freq = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    return freq

print(word_count("hello world hello"))`,
            testCases: [
                { input: "hello world hello", expected: {hello: 2, world: 1} },
                { input: "a a a b b c", expected: {a: 3, b: 2, c: 1} }
            ]
        },
        {
            id: 10,
            title: "Calculadora Simples",
            description: "Implemente uma calculadora que executa operações básicas",
            difficulty: "medium",
            starter: `def calculator(a, op, b):
    # Sua implementação aqui
    pass

print(calculator(10, '+', 5))   # 15
print(calculator(10, '*', 2))   # 20`,
            solution: `def calculator(a, op, b):
    if op == '+':
        return a + b
    elif op == '-':
        return a - b
    elif op == '*':
        return a * b
    elif op == '/':
        return a / b if b != 0 else "Erro"
    else:
        return "Operação inválida"

print(calculator(10, '+', 5))
print(calculator(10, '*', 2))`,
            testCases: [
                { input: [10, '+', 5], expected: 15 },
                { input: [10, '/', 2], expected: 5 },
                { input: [10, '/', 0], expected: "Erro" }
            ]
        },
        {
            id: 11,
            title: "Validação de Email",
            description: "Valide se um email segue o formato correto",
            difficulty: "medium",
            starter: `def validate_email(email):
    # Sua implementação aqui
    pass

print(validate_email("user@example.com"))  # True
print(validate_email("invalid"))  # False`,
            solution: `def validate_email(email):
    if '@' not in email:
        return False
    parts = email.split('@')
    if len(parts) != 2:
        return False
    local, domain = parts
    if not local or not domain:
        return False
    if '.' not in domain:
        return False
    return True

print(validate_email("user@example.com"))
print(validate_email("invalid"))`,
            testCases: [
                { input: "user@example.com", expected: true },
                { input: "invalid", expected: false },
                { input: "user@", expected: false }
            ]
        },
        {
            id: 12,
            title: "Maior e Menor",
            description: "Encontre o maior e menor elemento de um array",
            difficulty: "easy",
            starter: `def find_max_min(arr):
    # Sua implementação aqui
    pass

print(find_max_min([3, 1, 4, 1, 5, 9]))`,
            solution: `def find_max_min(arr):
    return max(arr), min(arr)

print(find_max_min([3, 1, 4, 1, 5, 9]))`,
            testCases: [
                { input: [3, 1, 4, 1, 5, 9], expected: [9, 1] },
                { input: [1], expected: [1, 1] }
            ]
        },
        {
            id: 13,
            title: "Remover Duplicatas",
            description: "Remova elementos duplicados mantendo a ordem",
            difficulty: "easy",
            starter: `def remove_duplicates(arr):
    # Sua implementação aqui
    pass

print(remove_duplicates([1, 2, 2, 3, 1, 4]))`,
            solution: `def remove_duplicates(arr):
    seen = set()
    result = []
    for item in arr:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

print(remove_duplicates([1, 2, 2, 3, 1, 4]))`,
            testCases: [
                { input: [1, 2, 2, 3, 1, 4], expected: [1, 2, 3, 4] },
                { input: [], expected: [] }
            ]
        },
        {
            id: 14,
            title: "Triângulo de Pascal",
            description: "Gere as primeiras n linhas do Triângulo de Pascal",
            difficulty: "medium",
            starter: `def pascal_triangle(n):
    # Sua implementação aqui
    pass

for row in pascal_triangle(5):
    print(row)`,
            solution: `def pascal_triangle(n):
    triangle = []
    for i in range(n):
        row = [1] * (i + 1)
        for j in range(1, i):
            row[j] = triangle[i-1][j-1] + triangle[i-1][j]
        triangle.append(row)
    return triangle

for row in pascal_triangle(5):
    print(row)`,
            testCases: [
                { input: 5, expected: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]] }
            ]
        },
        {
            id: 15,
            title: "Anagrama",
            description: "Verifique se duas strings são anagramas",
            difficulty: "easy",
            starter: `def is_anagram(s1, s2):
    # Sua implementação aqui
    pass

print(is_anagram("listen", "silent"))  # True
print(is_anagram("hello", "world"))     # False`,
            solution: `def is_anagram(s1, s2):
    return sorted(s1.lower()) == sorted(s2.lower())

print(is_anagram("listen", "silent"))
print(is_anagram("hello", "world"))`,
            testCases: [
                { input: ["listen", "silent"], expected: true },
                { input: ["hello", "world"], expected: false }
            ]
        }
    ],
    javascript: [
        {
            id: 1,
            title: "FizzBuzz",
            description: "Imprima números de 1 a 100. Múltiplos de 3 imprima 'Fizz', de 5 'Buzz', e de ambos 'FizzBuzz'",
            difficulty: "easy",
            starter: `function fizzBuzz(n) {
    // Sua implementação aqui
}

for (let i = 1; i <= 20; i++) {
    console.log(fizzBuzz(i));
}`,
            solution: `function fizzBuzz(n) {
    if (n % 15 === 0) return "FizzBuzz";
    if (n % 3 === 0) return "Fizz";
    if (n % 5 === 0) return "Buzz";
    return n.toString();
}

for (let i = 1; i <= 20; i++) {
    console.log(fizzBuzz(i));
}`,
            testCases: [
                { input: 15, expected: "FizzBuzz" },
                { input: 9, expected: "Fizz" },
                { input: 10, expected: "Buzz" }
            ]
        },
        {
            id: 2,
            title: "Palíndromo",
            description: "Verifique se uma string é um palíndromo",
            difficulty: "easy",
            starter: `function isPalindrome(s) {
    // Sua implementação aqui
}

console.log(isPalindrome("radar"));
console.log(isPalindrome("hello"));`,
            solution: `function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/\\s/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}

console.log(isPalindrome("radar"));
console.log(isPalindrome("hello"));`,
            testCases: [
                { input: "radar", expected: true },
                { input: "hello", expected: false }
            ]
        },
        {
            id: 3,
            title: "Fibonacci",
            description: "Retorne o n-ésimo número da sequência de Fibonacci",
            difficulty: "easy",
            starter: `function fibonacci(n) {
    // Sua implementação aqui
}

for (let i = 1; i <= 10; i++) {
    console.log(fibonacci(i));
}`,
            solution: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 1; i <= 10; i++) {
    console.log(fibonacci(i));
}`,
            testCases: [
                { input: 10, expected: 55 },
                { input: 1, expected: 1 }
            ]
        },
        {
            id: 4,
            title: "Fatorial",
            description: "Calcule o fatorial de um número",
            difficulty: "easy",
            starter: `function factorial(n) {
    // Sua implementação aqui
}

console.log(factorial(5));`,
            solution: `function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log(factorial(5));`,
            testCases: [
                { input: 5, expected: 120 },
                { input: 0, expected: 1 }
            ]
        },
        {
            id: 5,
            title: "Números Primos",
            description: "Verifique se um número é primo",
            difficulty: "easy",
            starter: `function isPrime(n) {
    // Sua implementação aqui
}

console.log(isPrime(17));
console.log(isPrime(15));`,
            solution: `function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

console.log(isPrime(17));
console.log(isPrime(15));`,
            testCases: [
                { input: 17, expected: true },
                { input: 1, expected: false }
            ]
        },
        {
            id: 6,
            title: "Bubble Sort",
            description: "Implemente o algoritmo Bubble Sort",
            difficulty: "medium",
            starter: `function bubbleSort(arr) {
    // Sua implementação aqui
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));`,
            solution: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));`,
            testCases: [
                { input: [5, 2, 8, 1], expected: [1, 2, 5, 8] }
            ]
        },
        {
            id: 7,
            title: "Busca Binária",
            description: "Implemente busca binária",
            difficulty: "medium",
            starter: `function binarySearch(arr, target) {
    // Sua implementação aqui
}

const arr = [1, 3, 5, 7, 9, 11, 13];
console.log(binarySearch(arr, 7));`,
            solution: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 13];
console.log(binarySearch(arr, 7));`,
            testCases: [
                { input: [[1,3,5,7,9], 5], expected: 2 },
                { input: [[1,3,5,7,9], 6], expected: -1 }
            ]
        },
        {
            id: 8,
            title: "Reversão de String",
            description: "Inverta uma string",
            difficulty: "easy",
            starter: `function reverseString(s) {
    // Sua implementação aqui
}

console.log(reverseString("hello"));`,
            solution: `function reverseString(s) {
    return s.split('').reverse().join('');
}

console.log(reverseString("hello"));`,
            testCases: [
                { input: "hello", expected: "olleh" }
            ]
        },
        {
            id: 9,
            title: "Contagem de Palavras",
            description: "Conte a frequência de cada palavra",
            difficulty: "medium",
            starter: `function wordCount(s) {
    // Sua implementação aqui
}

console.log(wordCount("hello world hello"));`,
            solution: `function wordCount(s) {
    const words = s.toLowerCase().split(/\\s+/);
    const freq = {};
    words.forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
    });
    return freq;
}

console.log(wordCount("hello world hello"));`,
            testCases: [
                { input: "hello world hello", expected: {hello: 2, world: 1} }
            ]
        },
        {
            id: 10,
            title: "Calculadora",
            description: "Implemente uma calculadora simples",
            difficulty: "medium",
            starter: `function calculator(a, op, b) {
    // Sua implementação aqui
}

console.log(calculator(10, '+', 5));`,
            solution: `function calculator(a, op, b) {
    const ops = { '+': a + b, '-': a - b, '*': a * b, '/': b !== 0 ? a / b : 'Erro' };
    return ops[op] || 'Inválido';
}

console.log(calculator(10, '+', 5));`,
            testCases: [
                { input: [10, '+', 5], expected: 15 },
                { input: [10, '/', 2], expected: 5 }
            ]
        },
        {
            id: 11,
            title: "Validação de Email",
            description: "Valide o formato de um email",
            difficulty: "medium",
            starter: `function validateEmail(email) {
    // Sua implementação aqui
}

console.log(validateEmail("user@example.com"));`,
            solution: `function validateEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

console.log(validateEmail("user@example.com"));`,
            testCases: [
                { input: "user@example.com", expected: true },
                { input: "invalid", expected: false }
            ]
        },
        {
            id: 12,
            title: "Maior e Menor",
            description: "Encontre maior e menor em array",
            difficulty: "easy",
            starter: `function findMaxMin(arr) {
    // Sua implementação aqui
}

console.log(findMaxMin([3, 1, 4, 1, 5, 9]));`,
            solution: `function findMaxMin(arr) {
    return [Math.max(...arr), Math.min(...arr)];
}

console.log(findMaxMin([3, 1, 4, 1, 5, 9]));`,
            testCases: [
                { input: [3, 1, 4, 1, 5, 9], expected: [9, 1] }
            ]
        },
        {
            id: 13,
            title: "Remover Duplicatas",
            description: "Remova elementos duplicados",
            difficulty: "easy",
            starter: `function removeDuplicates(arr) {
    // Sua implementação aqui
}

console.log(removeDuplicates([1, 2, 2, 3, 1, 4]));`,
            solution: `function removeDuplicates(arr) {
    return [...new Set(arr)];
}

console.log(removeDuplicates([1, 2, 2, 3, 1, 4]));`,
            testCases: [
                { input: [1, 2, 2, 3, 1, 4], expected: [1, 2, 3, 4] }
            ]
        },
        {
            id: 14,
            title: "Merge Sort",
            description: "Implemente o algoritmo Merge Sort",
            difficulty: "hard",
            starter: `function mergeSort(arr) {
    // Sua implementação aqui
}

console.log(mergeSort([64, 34, 25, 12, 22, 11, 90]));`,
            solution: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    while (left.length && right.length) {
        result.push(left[0] <= right[0] ? left.shift() : right.shift());
    }
    return [...result, ...left, ...right];
}

console.log(mergeSort([64, 34, 25, 12, 22, 11, 90]));`,
            testCases: [
                { input: [64, 34, 25, 12], expected: [12, 25, 34, 64] }
            ]
        },
        {
            id: 15,
            title: "Anagrama",
            description: "Verifique se duas strings são anagramas",
            difficulty: "easy",
            starter: `function isAnagram(s1, s2) {
    // Sua implementação aqui
}

console.log(isAnagram("listen", "silent"));`,
            solution: `function isAnagram(s1, s2) {
    const normalize = s => s.toLowerCase().split('').sort().join('');
    return normalize(s1) === normalize(s2);
}

console.log(isAnagram("listen", "silent"));`,
            testCases: [
                { input: ["listen", "silent"], expected: true },
                { input: ["hello", "world"], expected: false }
            ]
        }
    ],
    java: [
        {
            id: 1,
            title: "FizzBuzz",
            description: "Imprima FizzBuzz de 1 a 100",
            difficulty: "easy",
            starter: `public class Solution {
    public static String fizzBuzz(int n) {
        // Sua implementação aqui
        return "";
    }
    
    public static void main(String[] args) {
        for (int i = 1; i <= 20; i++) {
            System.out.println(fizzBuzz(i));
        }
    }
}`,
            solution: `public class Solution {
    public static String fizzBuzz(int n) {
        if (n % 15 == 0) return "FizzBuzz";
        if (n % 3 == 0) return "Fizz";
        if (n % 5 == 0) return "Buzz";
        return String.valueOf(n);
    }
    
    public static void main(String[] args) {
        for (int i = 1; i <= 20; i++) {
            System.out.println(fizzBuzz(i));
        }
    }
}`,
            testCases: [
                { input: 15, expected: "FizzBuzz" },
                { input: 9, expected: "Fizz" }
            ]
        },
        {
            id: 2,
            title: "Palíndromo",
            description: "Verifique se uma string é palíndromo",
            difficulty: "easy",
            starter: `public class Solution {
    public static boolean isPalindrome(String s) {
        // Sua implementação aqui
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(isPalindrome("radar"));
        System.out.println(isPalindrome("hello"));
    }
}`,
            solution: `public class Solution {
    public static boolean isPalindrome(String s) {
        String cleaned = s.toLowerCase().replaceAll(" ", "");
        String reversed = new StringBuilder(cleaned).reverse().toString();
        return cleaned.equals(reversed);
    }
    
    public static void main(String[] args) {
        System.out.println(isPalindrome("radar"));
        System.out.println(isPalindrome("hello"));
    }
}`,
            testCases: [
                { input: "radar", expected: true },
                { input: "hello", expected: false }
            ]
        },
        {
            id: 3,
            title: "Fibonacci",
            description: "Retorne o n-ésimo número de Fibonacci",
            difficulty: "easy",
            starter: `public class Solution {
    public static int fibonacci(int n) {
        // Sua implementação aqui
        return 0;
    }
    
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            System.out.println(fibonacci(i));
        }
    }
}`,
            solution: `public class Solution {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            System.out.println(fibonacci(i));
        }
    }
}`,
            testCases: [
                { input: 10, expected: 55 },
                { input: 1, expected: 1 }
            ]
        },
        {
            id: 4,
            title: "Fatorial",
            description: "Calcule o fatorial de um número",
            difficulty: "easy",
            starter: `public class Solution {
    public static long factorial(int n) {
        // Sua implementação aqui
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
            solution: `public class Solution {
    public static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
    
    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
            testCases: [
                { input: 5, expected: 120 },
                { input: 0, expected: 1 }
            ]
        },
        {
            id: 5,
            title: "Número Primo",
            description: "Verifique se um número é primo",
            difficulty: "easy",
            starter: `public class Solution {
    public static boolean isPrime(int n) {
        // Sua implementação aqui
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(isPrime(17));
        System.out.println(isPrime(15));
    }
}`,
            solution: `public class Solution {
    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i <= Math.sqrt(n); i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
    
    public static void main(String[] args) {
        System.out.println(isPrime(17));
        System.out.println(isPrime(15));
    }
}`,
            testCases: [
                { input: 17, expected: true },
                { input: 1, expected: false }
            ]
        },
        {
            id: 6,
            title: "Bubble Sort",
            description: "Implemente Bubble Sort",
            difficulty: "medium",
            starter: `public class Solution {
    public static int[] bubbleSort(int[] arr) {
        // Sua implementação aqui
        return arr;
    }
    
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        for (int num : bubbleSort(arr)) {
            System.out.print(num + " ");
        }
    }
}`,
            solution: `public class Solution {
    public static int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
    
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        for (int num : bubbleSort(arr)) {
            System.out.print(num + " ");
        }
    }
}`,
            testCases: [
                { input: [5, 2, 8, 1], expected: [1, 2, 5, 8] }
            ]
        },
        {
            id: 7,
            title: "Busca Binária",
            description: "Implemente busca binária",
            difficulty: "medium",
            starter: `public class Solution {
    public static int binarySearch(int[] arr, int target) {
        // Sua implementação aqui
        return -1;
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        System.out.println(binarySearch(arr, 7));
    }
}`,
            solution: `public class Solution {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        System.out.println(binarySearch(arr, 7));
    }
}`,
            testCases: [
                { input: [[1,3,5,7,9], 5], expected: 2 }
            ]
        },
        {
            id: 8,
            title: "Reversão de String",
            description: "Inverta uma string",
            difficulty: "easy",
            starter: `public class Solution {
    public static String reverseString(String s) {
        // Sua implementação aqui
        return "";
    }
    
    public static void main(String[] args) {
        System.out.println(reverseString("hello"));
    }
}`,
            solution: `public class Solution {
    public static String reverseString(String s) {
        StringBuilder sb = new StringBuilder(s);
        return sb.reverse().toString();
    }
    
    public static void main(String[] args) {
        System.out.println(reverseString("hello"));
    }
}`,
            testCases: [
                { input: "hello", expected: "olleh" }
            ]
        },
        {
            id: 9,
            title: "Contagem de Palavras",
            description: "Conte frequência de palavras",
            difficulty: "medium",
            starter: `import java.util.*;
public class Solution {
    public static Map<String, Integer> wordCount(String s) {
        // Sua implementação aqui
        return new HashMap<>();
    }
    
    public static void main(String[] args) {
        System.out.println(wordCount("hello world hello"));
    }
}`,
            solution: `import java.util.*;
public class Solution {
    public static Map<String, Integer> wordCount(String s) {
        Map<String, Integer> freq = new HashMap<>();
        String[] words = s.toLowerCase().split("\\\\s+");
        for (String word : words) {
            freq.put(word, freq.getOrDefault(word, 0) + 1);
        }
        return freq;
    }
    
    public static void main(String[] args) {
        System.out.println(wordCount("hello world hello"));
    }
}`,
            testCases: [
                { input: "hello world hello", expected: {hello: 2, world: 1} }
            ]
        },
        {
            id: 10,
            title: "Calculadora",
            description: "Implemente calculadora simples",
            difficulty: "medium",
            starter: `public class Solution {
    public static double calculator(double a, String op, double b) {
        // Sua implementação aqui
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(calculator(10, "+", 5));
    }
}`,
            solution: `public class Solution {
    public static double calculator(double a, String op, double b) {
        switch (op) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return b != 0 ? a / b : 0;
            default: return 0;
        }
    }
    
    public static void main(String[] args) {
        System.out.println(calculator(10, "+", 5));
    }
}`,
            testCases: [
                { input: [10, "+", 5], expected: 15 }
            ]
        },
        {
            id: 11,
            title: "Validação de Email",
            description: "Valide formato de email",
            difficulty: "medium",
            starter: `public class Solution {
    public static boolean validateEmail(String email) {
        // Sua implementação aqui
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(validateEmail("user@example.com"));
    }
}`,
            solution: `public class Solution {
    public static boolean validateEmail(String email) {
        return email.contains("@") && email.contains(".") && 
               email.indexOf("@") < email.lastIndexOf(".");
    }
    
    public static void main(String[] args) {
        System.out.println(validateEmail("user@example.com"));
    }
}`,
            testCases: [
                { input: "user@example.com", expected: true },
                { input: "invalid", expected: false }
            ]
        },
        {
            id: 12,
            title: "Maior e Menor",
            description: "Encontre maior e menor",
            difficulty: "easy",
            starter: `public class Solution {
    public static int[] findMaxMin(int[] arr) {
        // Sua implementação aqui
        return new int[]{0, 0};
    }
    
    public static void main(String[] args) {
        for (int num : findMaxMin(new int[]{3, 1, 4, 1, 5, 9})) {
            System.out.print(num + " ");
        }
    }
}`,
            solution: `public class Solution {
    public static int[] findMaxMin(int[] arr) {
        int max = arr[0], min = arr[0];
        for (int num : arr) {
            if (num > max) max = num;
            if (num < min) min = num;
        }
        return new int[]{max, min};
    }
    
    public static void main(String[] args) {
        for (int num : findMaxMin(new int[]{3, 1, 4, 1, 5, 9})) {
            System.out.print(num + " ");
        }
    }
}`,
            testCases: [
                { input: [3, 1, 4, 1, 5, 9], expected: [9, 1] }
            ]
        },
        {
            id: 13,
            title: "Remover Duplicatas",
            description: "Remova duplicatas do array",
            difficulty: "easy",
            starter: `import java.util.*;
public class Solution {
    public static List<Integer> removeDuplicates(int[] arr) {
        // Sua implementação aqui
        return new ArrayList<>();
    }
    
    public static void main(String[] args) {
        System.out.println(removeDuplicates(new int[]{1, 2, 2, 3, 1, 4}));
    }
}`,
            solution: `import java.util.*;
public class Solution {
    public static List<Integer> removeDuplicates(int[] arr) {
        Set<Integer> set = new LinkedHashSet<>();
        for (int num : arr) set.add(num);
        return new ArrayList<>(set);
    }
    
    public static void main(String[] args) {
        System.out.println(removeDuplicates(new int[]{1, 2, 2, 3, 1, 4}));
    }
}`,
            testCases: [
                { input: [1, 2, 2, 3, 1, 4], expected: [1, 2, 3, 4] }
            ]
        },
        {
            id: 14,
            title: "Quick Sort",
            description: "Implemente Quick Sort",
            difficulty: "hard",
            starter: `public class Solution {
    public static void quickSort(int[] arr, int low, int high) {
        // Sua implementação aqui
    }
    
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        quickSort(arr, 0, arr.length - 1);
        for (int num : arr) System.out.print(num + " ");
    }
}`,
            solution: `public class Solution {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
    
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        quickSort(arr, 0, arr.length - 1);
        for (int num : arr) System.out.print(num + " ");
    }
}`,
            testCases: [
                { input: [64, 34, 25, 12], expected: [12, 25, 34, 64] }
            ]
        },
        {
            id: 15,
            title: "Anagrama",
            description: "Verifique se são anagramas",
            difficulty: "easy",
            starter: `import java.util.*;
public class Solution {
    public static boolean isAnagram(String s1, String s2) {
        // Sua implementação aqui
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(isAnagram("listen", "silent"));
    }
}`,
            solution: `import java.util.*;
public class Solution {
    public static boolean isAnagram(String s1, String s2) {
        char[] a = s1.toLowerCase().toCharArray();
        char[] b = s2.toLowerCase().toCharArray();
        Arrays.sort(a);
        Arrays.sort(b);
        return Arrays.equals(a, b);
    }
    
    public static void main(String[] args) {
        System.out.println(isAnagram("listen", "silent"));
    }
}`,
            testCases: [
                { input: ["listen", "silent"], expected: true }
            ]
        }
    ],
    cpp: [
        {
            id: 1,
            title: "FizzBuzz",
            description: "Imprima FizzBuzz de 1 a 100",
            difficulty: "easy",
            starter: `#include <iostream>
using namespace std;

string fizzBuzz(int n) {
    // Sua implementação aqui
    return "";
}

int main() {
    for (int i = 1; i <= 20; i++) {
        cout << fizzBuzz(i) << endl;
    }
    return 0;
}`,
            solution: `#include <iostream>
using namespace std;

string fizzBuzz(int n) {
    if (n % 15 == 0) return "FizzBuzz";
    if (n % 3 == 0) return "Fizz";
    if (n % 5 == 0) return "Buzz";
    return to_string(n);
}

int main() {
    for (int i = 1; i <= 20; i++) {
        cout << fizzBuzz(i) << endl;
    }
    return 0;
}`,
            testCases: [
                { input: 15, expected: "FizzBuzz" },
                { input: 9, expected: "Fizz" }
            ]
        },
        {
            id: 2,
            title: "Palíndromo",
            description: "Verifique se uma string é palíndromo",
            difficulty: "easy",
            starter: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Sua implementação aqui
    return false;
}

int main() {
    cout << boolalpha << isPalindrome("radar") << endl;
    cout << isPalindrome("hello") << endl;
    return 0;
}`,
            solution: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isPalindrome(string s) {
    string cleaned = "";
    for (char c : s) {
        if (isalnum(c)) cleaned += tolower(c);
    }
    string reversed = cleaned;
    reverse(reversed.begin(), reversed.end());
    return cleaned == reversed;
}

int main() {
    cout << boolalpha << isPalindrome("radar") << endl;
    cout << isPalindrome("hello") << endl;
    return 0;
}`,
            testCases: [
                { input: "radar", expected: true },
                { input: "hello", expected: false }
            ]
        },
        {
            id: 3,
            title: "Fibonacci",
            description: "Retorne o n-ésimo número de Fibonacci",
            difficulty: "easy",
            starter: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    // Sua implementação aqui
    return 0;
}

int main() {
    for (int i = 1; i <= 10; i++) {
        cout << fibonacci(i) << endl;
    }
    return 0;
}`,
            solution: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    for (int i = 1; i <= 10; i++) {
        cout << fibonacci(i) << endl;
    }
    return 0;
}`,
            testCases: [
                { input: 10, expected: 55 },
                { input: 1, expected: 1 }
            ]
        },
        {
            id: 4,
            title: "Fatorial",
            description: "Calcule o fatorial de um número",
            difficulty: "easy",
            starter: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // Sua implementação aqui
    return 0;
}

int main() {
    cout << factorial(5) << endl;
    return 0;
}`,
            solution: `#include <iostream>
using namespace std;

long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << factorial(5) << endl;
    return 0;
}`,
            testCases: [
                { input: 5, expected: 120 },
                { input: 0, expected: 1 }
            ]
        },
        {
            id: 5,
            title: "Número Primo",
            description: "Verifique se um número é primo",
            difficulty: "easy",
            starter: `#include <iostream>
#include <cmath>
using namespace std;

bool isPrime(int n) {
    // Sua implementação aqui
    return false;
}

int main() {
    cout << boolalpha << isPrime(17) << endl;
    cout << isPrime(15) << endl;
    return 0;
}`,
            solution: `#include <iostream>
#include <cmath>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    cout << boolalpha << isPrime(17) << endl;
    cout << isPrime(15) << endl;
    return 0;
}`,
            testCases: [
                { input: 17, expected: true },
                { input: 1, expected: false }
            ]
        },
        {
            id: 6,
            title: "Bubble Sort",
            description: "Implemente Bubble Sort",
            difficulty: "medium",
            starter: `#include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    // Sua implementação aqui
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    return 0;
}`,
            solution: `#include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    return 0;
}`,
            testCases: [
                { input: [5, 2, 8, 1], expected: [1, 2, 5, 8] }
            ]
        },
        {
            id: 7,
            title: "Busca Binária",
            description: "Implemente busca binária",
            difficulty: "medium",
            starter: `#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    // Sua implementação aqui
    return -1;
}

int main() {
    int arr[] = {1, 3, 5, 7, 9, 11, 13};
    cout << binarySearch(arr, 7, 7) << endl;
    return 0;
}`,
            solution: `#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int arr[] = {1, 3, 5, 7, 9, 11, 13};
    cout << binarySearch(arr, 7, 7) << endl;
    return 0;
}`,
            testCases: [
                { input: [[1,3,5,7,9], 5], expected: 2 }
            ]
        },
        {
            id: 8,
            title: "Reversão de String",
            description: "Inverta uma string",
            difficulty: "easy",
            starter: `#include <iostream>
#include <string>
using namespace std;

string reverseString(string s) {
    // Sua implementação aqui
    return "";
}

int main() {
    cout << reverseString("hello") << endl;
    return 0;
}`,
            solution: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    reverse(s.begin(), s.end());
    return s;
}

int main() {
    cout << reverseString("hello") << endl;
    return 0;
}`,
            testCases: [
                { input: "hello", expected: "olleh" }
            ]
        },
        {
            id: 9,
            title: "Contagem de Palavras",
            description: "Conte frequência de palavras",
            difficulty: "medium",
            starter: `#include <iostream>
#include <unordered_map>
#include <sstream>
using namespace std;

unordered_map<string, int> wordCount(string s) {
    // Sua implementação aqui
    return {};
}

int main() {
    auto result = wordCount("hello world hello");
    for (auto& pair : result) {
        cout << pair.first << ": " << pair.second << endl;
    }
    return 0;
}`,
            solution: `#include <iostream>
#include <unordered_map>
#include <sstream>
using namespace std;

unordered_map<string, int> wordCount(string s) {
    unordered_map<string, int> freq;
    string word;
    istringstream iss(s);
    while (iss >> word) {
        freq[word]++;
    }
    return freq;
}

int main() {
    auto result = wordCount("hello world hello");
    for (auto& pair : result) {
        cout << pair.first << ": " << pair.second << endl;
    }
    return 0;
}`,
            testCases: [
                { input: "hello world hello", expected: {hello: 2, world: 1} }
            ]
        },
        {
            id: 10,
            title: "Calculadora",
            description: "Implemente calculadora simples",
            difficulty: "medium",
            starter: `#include <iostream>
using namespace std;

double calculator(double a, char op, double b) {
    // Sua implementação aqui
    return 0;
}

int main() {
    cout << calculator(10, '+', 5) << endl;
    return 0;
}`,
            solution: `#include <iostream>
using namespace std;

double calculator(double a, char op, double b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b != 0 ? a / b : 0;
        default: return 0;
    }
}

int main() {
    cout << calculator(10, '+', 5) << endl;
    return 0;
}`,
            testCases: [
                { input: [10, '+', 5], expected: 15 }
            ]
        },
        {
            id: 11,
            title: "Validação de Email",
            description: "Valide formato de email",
            difficulty: "medium",
            starter: `#include <iostream>
#include <string>
using namespace std;

bool validateEmail(string email) {
    // Sua implementação aqui
    return false;
}

int main() {
    cout << boolalpha << validateEmail("user@example.com") << endl;
    return 0;
}`,
            solution: `#include <iostream>
#include <string>
using namespace std;

bool validateEmail(string email) {
    size_t at = email.find('@');
    size_t dot = email.find('.', at);
    return at != string::npos && dot != string::npos && at < dot;
}

int main() {
    cout << boolalpha << validateEmail("user@example.com") << endl;
    return 0;
}`,
            testCases: [
                { input: "user@example.com", expected: true }
            ]
        },
        {
            id: 12,
            title: "Maior e Menor",
            description: "Encontre maior e menor",
            difficulty: "easy",
            starter: `#include <iostream>
#include <algorithm>
using namespace std;

pair<int, int> findMaxMin(int arr[], int n) {
    // Sua implementação aqui
    return {0, 0};
}

int main() {
    int arr[] = {3, 1, 4, 1, 5, 9};
    auto [max, min] = findMaxMin(arr, 6);
    cout << max << " " << min << endl;
    return 0;
}`,
            solution: `#include <iostream>
#include <algorithm>
using namespace std;

pair<int, int> findMaxMin(int arr[], int n) {
    return {*max_element(arr, arr + n), *min_element(arr, arr + n)};
}

int main() {
    int arr[] = {3, 1, 4, 1, 5, 9};
    auto [max, min] = findMaxMin(arr, 6);
    cout << max << " " << min << endl;
    return 0;
}`,
            testCases: [
                { input: [3, 1, 4, 1, 5, 9], expected: [9, 1] }
            ]
        },
        {
            id: 13,
            title: "Remover Duplicatas",
            description: "Remova duplicatas do array",
            difficulty: "easy",
            starter: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

vector<int> removeDuplicates(vector<int> arr) {
    // Sua implementação aqui
    return {};
}

int main() {
    vector<int> arr = {1, 2, 2, 3, 1, 4};
    for (int num : removeDuplicates(arr)) {
        cout << num << " ";
    }
    return 0;
}`,
            solution: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

vector<int> removeDuplicates(vector<int> arr) {
    vector<int> result;
    unordered_set<int> seen;
    for (int num : arr) {
        if (seen.find(num) == seen.end()) {
            seen.insert(num);
            result.push_back(num);
        }
    }
    return result;
}

int main() {
    vector<int> arr = {1, 2, 2, 3, 1, 4};
    for (int num : removeDuplicates(arr)) {
        cout << num << " ";
    }
    return 0;
}`,
            testCases: [
                { input: [1, 2, 2, 3, 1, 4], expected: [1, 2, 3, 4] }
            ]
        },
        {
            id: 14,
            title: "Merge Sort",
            description: "Implemente Merge Sort",
            difficulty: "hard",
            starter: `#include <iostream>
using namespace std;

void mergeSort(int arr[], int left, int right) {
    // Sua implementação aqui
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr, 0, 6);
    for (int num : arr) cout << num << " ";
    return 0;
}`,
            solution: `#include <iostream>
using namespace std;

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr, 0, 6);
    for (int num : arr) cout << num << " ";
    return 0;
}`,
            testCases: [
                { input: [64, 34, 25, 12], expected: [12, 25, 34, 64] }
            ]
        },
        {
            id: 15,
            title: "Anagrama",
            description: "Verifique se são anagramas",
            difficulty: "easy",
            starter: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isAnagram(string s1, string s2) {
    // Sua implementação aqui
    return false;
}

int main() {
    cout << boolalpha << isAnagram("listen", "silent") << endl;
    return 0;
}`,
            solution: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isAnagram(string s1, string s2) {
    sort(s1.begin(), s1.end());
    sort(s2.begin(), s2.end());
    return s1 == s2;
}

int main() {
    cout << boolalpha << isAnagram("listen", "silent") << endl;
    return 0;
}`,
            testCases: [
                { input: ["listen", "silent"], expected: true }
            ]
        }
    ],
    go: [
        {
            id: 1,
            title: "FizzBuzz",
            description: "Imprima FizzBuzz de 1 a 100",
            difficulty: "easy",
            starter: `package main

import "fmt"

func fizzBuzz(n int) string {
    // Sua implementação aqui
    return ""
}

func main() {
    for i := 1; i <= 20; i++ {
        fmt.Println(fizzBuzz(i))
    }
}`,
            solution: `package main

import "fmt"

func fizzBuzz(n int) string {
    if n%15 == 0 {
        return "FizzBuzz"
    }
    if n%3 == 0 {
        return "Fizz"
    }
    if n%5 == 0 {
        return "Buzz"
    }
    return fmt.Sprintf("%d", n)
}

func main() {
    for i := 1; i <= 20; i++ {
        fmt.Println(fizzBuzz(i))
    }
}`,
            testCases: [
                { input: 15, expected: "FizzBuzz" },
                { input: 9, expected: "Fizz" }
            ]
        },
        {
            id: 2,
            title: "Palíndromo",
            description: "Verifique se uma string é palíndromo",
            difficulty: "easy",
            starter: `package main

import "fmt"
import "strings"

func isPalindrome(s string) bool {
    // Sua implementação aqui
    return false
}

func main() {
    fmt.Println(isPalindrome("radar"))
    fmt.Println(isPalindrome("hello"))
}`,
            solution: `package main

import (
    "fmt"
    "strings"
    "unicode"
)

func isPalindrome(s string) bool {
    var cleaned strings.Builder
    for _, r := range strings.ToLower(s) {
        if unicode.IsLetter(r) || unicode.IsDigit(r) {
            cleaned.WriteRune(r)
        }
    }
    cleanedStr := cleaned.String()
    runes := []rune(cleanedStr)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        if runes[i] != runes[j] {
            return false
        }
    }
    return true
}

func main() {
    fmt.Println(isPalindrome("radar"))
    fmt.Println(isPalindrome("hello"))
}`,
            testCases: [
                { input: "radar", expected: true },
                { input: "hello", expected: false }
            ]
        },
        {
            id: 3,
            title: "Fibonacci",
            description: "Retorne o n-ésimo número de Fibonacci",
            difficulty: "easy",
            starter: `package main

import "fmt"

func fibonacci(n int) int {
    // Sua implementação aqui
    return 0
}

func main() {
    for i := 1; i <= 10; i++ {
        fmt.Println(fibonacci(i))
    }
}`,
            solution: `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    for i := 1; i <= 10; i++ {
        fmt.Println(fibonacci(i))
    }
}`,
            testCases: [
                { input: 10, expected: 55 },
                { input: 1, expected: 1 }
            ]
        },
        {
            id: 4,
            title: "Fatorial",
            description: "Calcule o fatorial de um número",
            difficulty: "easy",
            starter: `package main

import "fmt"

func factorial(n int) int {
    // Sua implementação aqui
    return 0
}

func main() {
    fmt.Println(factorial(5))
}`,
            solution: `package main

import "fmt"

func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n-1)
}

func main() {
    fmt.Println(factorial(5))
}`,
            testCases: [
                { input: 5, expected: 120 },
                { input: 0, expected: 1 }
            ]
        },
        {
            id: 5,
            title: "Número Primo",
            description: "Verifique se um número é primo",
            difficulty: "easy",
            starter: `package main

import "fmt"
import "math"

func isPrime(n int) bool {
    // Sua implementação aqui
    return false
}

func main() {
    fmt.Println(isPrime(17))
    fmt.Println(isPrime(15))
}`,
            solution: `package main

import (
    "fmt"
    "math"
)

func isPrime(n int) bool {
    if n < 2 {
        return false
    }
    for i := 2; i <= int(math.Sqrt(float64(n))); i++ {
        if n%i == 0 {
            return false
        }
    }
    return true
}

func main() {
    fmt.Println(isPrime(17))
    fmt.Println(isPrime(15))
}`,
            testCases: [
                { input: 17, expected: true },
                { input: 1, expected: false }
            ]
        },
        {
            id: 6,
            title: "Bubble Sort",
            description: "Implemente Bubble Sort",
            difficulty: "medium",
            starter: `package main

import "fmt"

func bubbleSort(arr []int) []int {
    // Sua implementação aqui
    return arr
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    for _, num := range bubbleSort(arr) {
        fmt.Print(num, " ")
    }
}`,
            solution: `package main

import "fmt"

func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    for _, num := range bubbleSort(arr) {
        fmt.Print(num, " ")
    }
}`,
            testCases: [
                { input: [5, 2, 8, 1], expected: [1, 2, 5, 8] }
            ]
        },
        {
            id: 7,
            title: "Busca Binária",
            description: "Implemente busca binária",
            difficulty: "medium",
            starter: `package main

import "fmt"

func binarySearch(arr []int, target int) int {
    // Sua implementação aqui
    return -1
}

func main() {
    arr := []int{1, 3, 5, 7, 9, 11, 13}
    fmt.Println(binarySearch(arr, 7))
}`,
            solution: `package main

import "fmt"

func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := (left + right) / 2
        if arr[mid] == target {
            return mid
        }
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

func main() {
    arr := []int{1, 3, 5, 7, 9, 11, 13}
    fmt.Println(binarySearch(arr, 7))
}`,
            testCases: [
                { input: [[1,3,5,7,9], 5], expected: 2 }
            ]
        },
        {
            id: 8,
            title: "Reversão de String",
            description: "Inverta uma string",
            difficulty: "easy",
            starter: `package main

import "fmt"

func reverseString(s string) string {
    // Sua implementação aqui
    return ""
}

func main() {
    fmt.Println(reverseString("hello"))
}`,
            solution: `package main

import "fmt"

func reverseString(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}

func main() {
    fmt.Println(reverseString("hello"))
}`,
            testCases: [
                { input: "hello", expected: "olleh" }
            ]
        },
        {
            id: 9,
            title: "Contagem de Palavras",
            description: "Conte frequência de palavras",
            difficulty: "medium",
            starter: `package main

import "fmt"
import "strings"

func wordCount(s string) map[string]int {
    // Sua implementação aqui
    return map[string]int{}
}

func main() {
    result := wordCount("hello world hello")
    fmt.Println(result)
}`,
            solution: `package main

import (
    "fmt"
    "strings"
)

func wordCount(s string) map[string]int {
    words := strings.Fields(strings.ToLower(s))
    freq := make(map[string]int)
    for _, word := range words {
        freq[word]++
    }
    return freq
}

func main() {
    result := wordCount("hello world hello")
    fmt.Println(result)
}`,
            testCases: [
                { input: "hello world hello", expected: {hello: 2, world: 1} }
            ]
        },
        {
            id: 10,
            title: "Calculadora",
            description: "Implemente calculadora simples",
            difficulty: "medium",
            starter: `package main

import "fmt"

func calculator(a float64, op string, b float64) float64 {
    // Sua implementação aqui
    return 0
}

func main() {
    fmt.Println(calculator(10, "+", 5))
}`,
            solution: `package main

import "fmt"

func calculator(a float64, op string, b float64) float64 {
    switch op {
    case "+":
        return a + b
    case "-":
        return a - b
    case "*":
        return a * b
    case "/":
        if b != 0 {
            return a / b
        }
        return 0
    }
    return 0
}

func main() {
    fmt.Println(calculator(10, "+", 5))
}`,
            testCases: [
                { input: [10, "+", 5], expected: 15 }
            ]
        },
        {
            id: 11,
            title: "Validação de Email",
            description: "Valide formato de email",
            difficulty: "medium",
            starter: `package main

import "fmt"
import "strings"

func validateEmail(email string) bool {
    // Sua implementação aqui
    return false
}

func main() {
    fmt.Println(validateEmail("user@example.com"))
}`,
            solution: `package main

import (
    "fmt"
    "strings"
)

func validateEmail(email string) bool {
    return strings.Contains(email, "@") && strings.Contains(email, ".")
}

func main() {
    fmt.Println(validateEmail("user@example.com"))
}`,
            testCases: [
                { input: "user@example.com", expected: true },
                { input: "invalid", expected: false }
            ]
        },
        {
            id: 12,
            title: "Maior e Menor",
            description: "Encontre maior e menor",
            difficulty: "easy",
            starter: `package main

import "fmt"

func findMaxMin(arr []int) (int, int) {
    // Sua implementação aqui
    return 0, 0
}

func main() {
    max, min := findMaxMin([]int{3, 1, 4, 1, 5, 9})
    fmt.Println(max, min)
}`,
            solution: `package main

import "fmt"

func findMaxMin(arr []int) (int, int) {
    max, min := arr[0], arr[0]
    for _, num := range arr {
        if num > max {
            max = num
        }
        if num < min {
            min = num
        }
    }
    return max, min
}

func main() {
    max, min := findMaxMin([]int{3, 1, 4, 1, 5, 9})
    fmt.Println(max, min)
}`,
            testCases: [
                { input: [3, 1, 4, 1, 5, 9], expected: [9, 1] }
            ]
        },
        {
            id: 13,
            title: "Remover Duplicatas",
            description: "Remova duplicatas do slice",
            difficulty: "easy",
            starter: `package main

import "fmt"

func removeDuplicates(arr []int) []int {
    // Sua implementação aqui
    return []int{}
}

func main() {
    fmt.Println(removeDuplicates([]int{1, 2, 2, 3, 1, 4}))
}`,
            solution: `package main

import "fmt"

func removeDuplicates(arr []int) []int {
    seen := make(map[int]bool)
    result := []int{}
    for _, num := range arr {
        if !seen[num] {
            seen[num] = true
            result = append(result, num)
        }
    }
    return result
}

func main() {
    fmt.Println(removeDuplicates([]int{1, 2, 2, 3, 1, 4}))
}`,
            testCases: [
                { input: [1, 2, 2, 3, 1, 4], expected: [1, 2, 3, 4] }
            ]
        },
        {
            id: 14,
            title: "Quick Sort",
            description: "Implemente Quick Sort",
            difficulty: "hard",
            starter: `package main

import "fmt"

func quickSort(arr []int) []int {
    // Sua implementação aqui
    return arr
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    fmt.Println(quickSort(arr))
}`,
            solution: `package main

import "fmt"

func quickSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    pivot := arr[len(arr)/2]
    var left, mid, right []int
    for _, num := range arr {
        if num < pivot {
            left = append(left, num)
        } else if num == pivot {
            mid = append(mid, num)
        } else {
            right = append(right, num)
        }
    }
    left = quickSort(left)
    right = quickSort(right)
    return append(append(left, mid...), right...)
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    fmt.Println(quickSort(arr))
}`,
            testCases: [
                { input: [64, 34, 25, 12], expected: [12, 25, 34, 64] }
            ]
        },
        {
            id: 15,
            title: "Anagrama",
            description: "Verifique se são anagramas",
            difficulty: "easy",
            starter: `package main

import "fmt"
import "sort"
import "strings"

func isAnagram(s1, s2 string) bool {
    // Sua implementação aqui
    return false
}

func main() {
    fmt.Println(isAnagram("listen", "silent"))
}`,
            solution: `package main

import (
    "fmt"
    "sort"
    "strings"
)

func isAnagram(s1, s2 string) bool {
    s1 = strings.ToLower(s1)
    s2 = strings.ToLower(s2)
    r1 := strings.Split(s1, "")
    r2 := strings.Split(s2, "")
    sort.Strings(r1)
    sort.Strings(r2)
    return strings.Join(r1, "") == strings.Join(r2, "")
}

func main() {
    fmt.Println(isAnagram("listen", "silent"))
}`,
            testCases: [
                { input: ["listen", "silent"], expected: true }
            ]
        }
    ]
};

const LANGUAGE_INFO = {
    python: { name: "Python", icon: "🐍", color: "#3776ab" },
    javascript: { name: "JavaScript", icon: "🌐", color: "#f7df1e" },
    java: { name: "Java", icon: "☕", color: "#ed8b00" },
    cpp: { name: "C++", icon: "⚡", color: "#00599c" },
    go: { name: "Go", icon: "🔷", color: "#00add8" }
};

const ACHIEVEMENTS = [
    { id: "first_exercise", name: "Primeiro Passo", desc: "Complete seu primeiro exercício", icon: "🎯" },
    { id: "first_language", name: "Polyglot", desc: "Complete todos os exercícios de uma linguagem", icon: "🌍" },
    { id: "easy_master", name: "Iniciante Dev", desc: "Complete 10 exercícios fáceis", icon: "⭐" },
    { id: "medium_master", name: "Desenvolvedor", desc: "Complete 10 exercícios médios", icon: "🚀" },
    { id: "hard_master", name: "Expert", desc: "Complete 10 exercícios difíceis", icon: "💎" },
    { id: "all_languages", name: "Mestre das Linguagens", desc: "Complete exercícios em todas as linguagens", icon: "🏆" }
];

const App = {
    currentUser: null,
    currentLanguage: null,
    currentExercise: null,
    isFullscreen: false,

    init() {
        this.loadUser();
        this.setupNavigation();
        this.updateUI();
    },

    loadUser() {
        const userData = localStorage.getItem('training_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    },

    saveUser() {
        if (this.currentUser) {
            localStorage.setItem('training_user', JSON.stringify(this.currentUser));
        }
    },

    setupNavigation() {
        const radios = document.querySelectorAll('input[name="page"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => this.updateUI());
        });
    },

    updateUI() {
        const loginRadio = document.getElementById('page-login');
        const dashboardRadio = document.getElementById('page-dashboard');
        const exercisesRadio = document.getElementById('page-exercises');
        const progressRadio = document.getElementById('page-progress');

        if (!this.currentUser) {
            loginRadio.checked = true;
            document.getElementById('header-actions').style.display = 'none';
        } else {
            dashboardRadio.checked = true;
            document.getElementById('header-actions').style.display = 'flex';
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('user-avatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
        }

        this.renderDashboard();
        this.renderExercises();
        this.renderProgress();
    },

    login(name) {
        const existingData = localStorage.getItem('training_user');
        let userData;
        
        if (existingData) {
            userData = JSON.parse(existingData);
            userData.name = name;
        } else {
            userData = {
                name: name,
                createdAt: new Date().toISOString(),
                progress: {},
                achievements: [],
                activity: []
            };
            Object.keys(EXERCISES).forEach(lang => {
                userData.progress[lang] = { completed: [], started: [] };
            });
        }
        
        this.currentUser = userData;
        this.saveUser();
        this.updateUI();
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('training_user');
        this.updateUI();
    },

    selectLanguage(lang) {
        this.currentLanguage = lang;
        document.getElementById('page-exercises').checked = true;
        this.renderExercises();
    },

    selectExercise(exercise) {
        this.currentExercise = exercise;
        this.renderExerciseEditor();
    },

    renderDashboard() {
        if (!this.currentUser) return;

        const stats = document.getElementById('dashboard-stats');
        const langGrid = document.getElementById('dashboard-languages');
        const activityList = document.getElementById('activity-list');

        let totalCompleted = 0;
        let totalExercises = 0;
        Object.keys(EXERCISES).forEach(lang => {
            totalExercises += EXERCISES[lang].length;
            totalCompleted += (this.currentUser.progress[lang]?.completed?.length || 0);
        });

        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Exercícios Completos</div>
                <div class="stat-value">${totalCompleted}/${totalExercises}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Conquistas</div>
                <div class="stat-value">${this.currentUser.achievements?.length || 0}/${ACHIEVEMENTS.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Linguagens</div>
                <div class="stat-value small">${Object.keys(EXERCISES).length}</div>
            </div>
        `;

        langGrid.innerHTML = Object.keys(EXERCISES).map(lang => {
            const info = LANGUAGE_INFO[lang];
            const progress = this.currentUser.progress[lang] || { completed: [] };
            const percent = Math.round((progress.completed.length / EXERCISES[lang].length) * 100);
            return `
                <div class="language-card ${lang}" onclick="App.selectLanguage('${lang}')">
                    <div class="language-icon">${info.icon}</div>
                    <div class="language-name">${info.name}</div>
                    <div class="language-progress">${progress.completed.length}/${EXERCISES[lang].length} exercícios</div>
                    <div class="progress-bar">
                        <div class="progress-fill ${lang}" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        const activities = this.currentUser.activity?.slice(-10).reverse() || [];
        if (activities.length === 0) {
            activityList.innerHTML = '<div class="empty-state"><span>📝</span><p>Nenhuma atividade ainda</p></div>';
        } else {
            activityList.innerHTML = activities.map(a => `
                <div class="activity-item">
                    <div class="activity-icon ${a.type}">${a.type === 'completed' ? '✅' : '▶️'}</div>
                    <div class="activity-info">
                        <div class="activity-title">${a.exercise}</div>
                        <div class="activity-time">${LANGUAGE_INFO[a.language]?.icon} ${LANGUAGE_INFO[a.language]?.name} • ${this.formatTime(a.timestamp)}</div>
                    </div>
                </div>
            `).join('');
        }
    },

    renderExercises() {
        if (!this.currentLanguage) {
            document.getElementById('exercise-list').innerHTML = `
                <div class="empty-state">
                    <span>🏋️</span>
                    <h3>Selecione uma linguagem</h3>
                    <p>Escolha uma linguagem no dashboard para ver os exercícios</p>
                </div>
            `;
            document.getElementById('exercise-editor').style.display = 'none';
            return;
        }

        const exercises = EXERCISES[this.currentLanguage];
        const progress = this.currentUser.progress[this.currentLanguage] || { completed: [] };

        document.getElementById('exercise-list').innerHTML = exercises.map(ex => {
            const isCompleted = progress.completed.includes(ex.id);
            return `
                <div class="exercise-item ${isCompleted ? 'completed' : ''}" onclick="App.selectExercise(${ex.id})">
                    <div class="exercise-number">${isCompleted ? '✓' : ex.id}</div>
                    <div class="exercise-info">
                        <div class="exercise-title">${ex.title}</div>
                        <div class="exercise-desc">${ex.description}</div>
                    </div>
                    <span class="exercise-difficulty difficulty-${ex.difficulty}">${ex.difficulty}</span>
                </div>
            `;
        }).join('');

        document.getElementById('exercise-editor').style.display = 'none';
    },

    renderExerciseEditor() {
        const exercises = EXERCISES[this.currentLanguage];
        const exercise = exercises.find(e => e.id === this.currentExercise);
        if (!exercise) return;

        const info = LANGUAGE_INFO[this.currentLanguage];
        const progress = this.currentUser.progress[this.currentLanguage];
        const isCompleted = progress.completed.includes(exercise.id);

        document.getElementById('exercise-editor').style.display = 'block';
        document.getElementById('exercise-title').textContent = exercise.title;
        document.getElementById('exercise-desc').textContent = exercise.description;
        document.getElementById('language-badge').className = `language-badge ${this.currentLanguage}`;
        document.getElementById('language-badge').innerHTML = `${info.icon} ${info.name}`;
        document.getElementById('exercise-difficulty').className = `exercise-difficulty difficulty-${exercise.difficulty}`;
        document.getElementById('exercise-difficulty').textContent = exercise.difficulty;

        const savedCode = this.currentUser.code?.[`${this.currentLanguage}_${exercise.id}`] || exercise.starter;
        document.getElementById('code-editor').value = savedCode;
        document.getElementById('output').textContent = '';

        document.getElementById('btn-show-solution').style.display = isCompleted ? 'none' : 'inline-flex';
        document.getElementById('btn-mark-complete').style.display = isCompleted ? 'none' : 'inline-flex';
    },

    saveCode() {
        let code;
        if (this.isFullscreen) {
            code = document.getElementById('fs-code-editor').value;
            const normalEditor = document.getElementById('code-editor');
            if (normalEditor) normalEditor.value = code;
        } else {
            code = document.getElementById('code-editor').value;
        }
        if (!this.currentUser.code) this.currentUser.code = {};
        this.currentUser.code[`${this.currentLanguage}_${this.currentExercise}`] = code;
        this.saveUser();
    },

    runCode() {
        const code = document.getElementById('code-editor').value;
        const output = document.getElementById('output');
        
        this.saveCode();

        if (this.currentLanguage === 'javascript') {
            try {
                const logs = [];
                const originalLog = console.log;
                console.log = (...args) => logs.push(args.map(a => 
                    typeof a === 'object' ? JSON.stringify(a) : String(a)
                ).join(' '));
                
                eval(code);
                console.log = originalLog;
                
                output.textContent = logs.join('\n') || 'Código executado com sucesso!';
                output.className = 'output-content success';
            } catch (e) {
                output.textContent = 'Erro: ' + e.message;
                output.className = 'output-content error';
            }
        } else {
            output.textContent = 'A execução de código requer um ambiente de runtime.\nPara executar código Python, Java, C++ ou Go, use um IDE local ou plataformas online como:\n\n• Python: https://www.python.org/shell/\n• Java: https://www.jdoodle.com/\n• C++: https://www.jdoodle.com/c-online-compiler/\n• Go: https://play.golang.org/';
            output.className = 'output-content';
        }
    },

    showSolution() {
        const exercises = EXERCISES[this.currentLanguage];
        const exercise = exercises.find(e => e.id === this.currentExercise);
        if (!exercise) return;

        document.getElementById('code-editor').value = exercise.solution;
        this.saveCode();
    },

    markComplete() {
        if (!this.currentUser.progress[this.currentLanguage]) {
            this.currentUser.progress[this.currentLanguage] = { completed: [], started: [] };
        }

        const progress = this.currentUser.progress[this.currentLanguage];
        if (!progress.completed.includes(this.currentExercise)) {
            progress.completed.push(this.currentExercise);

            const exercises = EXERCISES[this.currentLanguage];
            const exercise = exercises.find(e => e.id === this.currentExercise);

            this.currentUser.activity = this.currentUser.activity || [];
            this.currentUser.activity.push({
                type: 'completed',
                exercise: exercise.title,
                language: this.currentLanguage,
                timestamp: Date.now()
            });

            this.checkAchievements();
            this.saveUser();
            this.renderDashboard();
            this.renderExerciseEditor();
            this.renderExercises();

            document.getElementById('output').textContent = '🎉 Exercício concluído!';
            document.getElementById('output').className = 'output-content success';
        }
    },

    checkAchievements() {
        this.currentUser.achievements = this.currentUser.achievements || [];
        
        let totalCompleted = 0;
        let easyCompleted = 0, mediumCompleted = 0, hardCompleted = 0;
        let languagesStarted = 0;

        Object.keys(EXERCISES).forEach(lang => {
            const progress = this.currentUser.progress[lang];
            if (progress?.completed?.length > 0) {
                languagesStarted++;
                progress.completed.forEach(id => {
                    const ex = EXERCISES[lang].find(e => e.id === id);
                    totalCompleted++;
                    if (ex?.difficulty === 'easy') easyCompleted++;
                    if (ex?.difficulty === 'medium') mediumCompleted++;
                    if (ex?.difficulty === 'hard') hardCompleted++;
                });
            }
        });

        if (totalCompleted >= 1 && !this.currentUser.achievements.includes('first_exercise')) {
            this.currentUser.achievements.push('first_exercise');
        }

        Object.keys(EXERCISES).forEach(lang => {
            if (this.currentUser.progress[lang]?.completed?.length === EXERCISES[lang].length) {
                if (!this.currentUser.achievements.includes('first_language')) {
                    this.currentUser.achievements.push('first_language');
                }
            }
        });

        if (easyCompleted >= 10 && !this.currentUser.achievements.includes('easy_master')) {
            this.currentUser.achievements.push('easy_master');
        }
        if (mediumCompleted >= 10 && !this.currentUser.achievements.includes('medium_master')) {
            this.currentUser.achievements.push('medium_master');
        }
        if (hardCompleted >= 10 && !this.currentUser.achievements.includes('hard_master')) {
            this.currentUser.achievements.push('hard_master');
        }
        if (languagesStarted === Object.keys(EXERCISES).length && !this.currentUser.achievements.includes('all_languages')) {
            this.currentUser.achievements.push('all_languages');
        }
    },

    renderProgress() {
        if (!this.currentUser) return;

        const chartContainer = document.getElementById('progress-chart');
        const achievementsContainer = document.getElementById('progress-achievements');

        const languages = Object.keys(EXERCISES);
        const maxHeight = 180;
        
        chartContainer.innerHTML = `
            <div class="chart-title">Progresso por Linguagem</div>
            <div class="bar-chart">
                ${languages.map(lang => {
                    const completed = this.currentUser.progress[lang]?.completed?.length || 0;
                    const total = EXERCISES[lang].length;
                    const height = (completed / total) * maxHeight;
                    const info = LANGUAGE_INFO[lang];
                    return `
                        <div class="bar-item">
                            <div class="bar" style="height: ${height}px; background: ${info.color};" data-value="${completed}"></div>
                            <div class="bar-label">${info.icon}<br>${completed}/${total}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        achievementsContainer.innerHTML = `
            <div class="chart-title">Conquistas</div>
            <div class="achievements-grid">
                ${ACHIEVEMENTS.map(a => {
                    const unlocked = this.currentUser.achievements?.includes(a.id);
                    return `
                        <div class="achievement-badge ${unlocked ? 'unlocked' : ''}">
                            <span>${a.icon}</span>
                            <span>${a.name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    formatTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m atrás`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h atrás`;
        const days = Math.floor(hours / 24);
        return `${days}d atrás`;
    },

    backToLanguages() {
        this.currentLanguage = null;
        this.currentExercise = null;
        document.getElementById('exercise-editor').style.display = 'none';
        this.renderExercises();
    },

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        const fullscreenEditor = document.getElementById('fullscreen-editor');
        const exitBtn = document.getElementById('exit-fullscreen-btn');
        const normalEditor = document.getElementById('exercise-editor');
        
        if (this.isFullscreen) {
            fullscreenEditor.classList.add('active');
            exitBtn.style.display = 'flex';
            normalEditor.style.visibility = 'hidden';
            const textarea = document.getElementById('code-editor');
            if (textarea) textarea.focus();
        } else {
            fullscreenEditor.classList.remove('active');
            exitBtn.style.display = 'none';
            normalEditor.style.visibility = 'visible';
        }
    },

    exitFullscreen() {
        this.isFullscreen = false;
        const fullscreenEditor = document.getElementById('fullscreen-editor');
        const exitBtn = document.getElementById('exit-fullscreen-btn');
        const normalEditor = document.getElementById('exercise-editor');
        
        fullscreenEditor.classList.remove('active');
        exitBtn.style.display = 'none';
        normalEditor.style.visibility = 'visible';
    },

    runCodeFullscreen() {
        const code = document.getElementById('fs-code-editor').value;
        const output = document.getElementById('output-fullscreen');
        
        this.saveCode();

        if (this.currentLanguage === 'javascript') {
            try {
                const logs = [];
                const originalLog = console.log;
                console.log = (...args) => logs.push(args.map(a => 
                    typeof a === 'object' ? JSON.stringify(a) : String(a)
                ).join(' '));
                
                eval(code);
                console.log = originalLog;
                
                output.textContent = logs.join('\n') || 'Código executado com sucesso!';
                output.className = 'output-content success';
            } catch (e) {
                output.textContent = 'Erro: ' + e.message;
                output.className = 'output-content error';
            }
        } else {
            output.textContent = 'A execução de código requer um ambiente de runtime.\nPara executar código Python, Java, C++ ou Go, use um IDE local ou plataformas online como:\n\n• Python: https://www.python.org/shell/\n• Java: https://www.jdoodle.com/\n• C++: https://www.jdoodle.com/c-online-compiler/\n• Go: https://play.golang.org/';
            output.className = 'output-content';
        }
    },

    showSolutionFullscreen() {
        const exercises = EXERCISES[this.currentLanguage];
        const exercise = exercises.find(e => e.id === this.currentExercise);
        if (!exercise) return;

        const fsCodeEditor = document.getElementById('fs-code-editor');
        const normalCodeEditor = document.getElementById('code-editor');
        fsCodeEditor.value = exercise.solution;
        if (normalCodeEditor) normalCodeEditor.value = exercise.solution;
        this.saveCode();
    },

    markCompleteFullscreen() {
        if (!this.currentUser.progress[this.currentLanguage]) {
            this.currentUser.progress[this.currentLanguage] = { completed: [], started: [] };
        }

        const progress = this.currentUser.progress[this.currentLanguage];
        if (!progress.completed.includes(this.currentExercise)) {
            progress.completed.push(this.currentExercise);

            const exercises = EXERCISES[this.currentLanguage];
            const exercise = exercises.find(e => e.id === this.currentExercise);

            this.currentUser.activity = this.currentUser.activity || [];
            this.currentUser.activity.push({
                type: 'completed',
                exercise: exercise.title,
                language: this.currentLanguage,
                timestamp: Date.now()
            });

            this.checkAchievements();
            this.saveUser();
            this.renderDashboard();
            this.renderExerciseEditor();
            this.renderExercises();

            const output = document.getElementById('output-fullscreen');
            output.textContent = '🎉 Exercício concluído!';
            output.className = 'output-content success';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('login-name').value.trim();
        if (name) {
            App.login(name);
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => App.logout());
    document.getElementById('btn-run').addEventListener('click', () => App.runCode());
    document.getElementById('btn-show-solution').addEventListener('click', () => App.showSolution());
    document.getElementById('btn-mark-complete').addEventListener('click', () => App.markComplete());
    document.getElementById('btn-back').addEventListener('click', () => App.backToLanguages());
    document.getElementById('code-editor').addEventListener('blur', () => App.saveCode());
    
    document.getElementById('expand-fullscreen').addEventListener('click', () => App.toggleFullscreen());
    document.getElementById('exit-fullscreen-btn').addEventListener('click', () => App.exitFullscreen());
    document.getElementById('btn-run-fullscreen').addEventListener('click', () => App.runCodeFullscreen());
    document.getElementById('btn-solution-fullscreen').addEventListener('click', () => App.showSolutionFullscreen());
    document.getElementById('btn-complete-fullscreen').addEventListener('click', () => App.markCompleteFullscreen());
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && App.isFullscreen) {
            App.exitFullscreen();
        }
        if (e.key === 'Enter' && e.ctrlKey && App.isFullscreen) {
            App.runCodeFullscreen();
        }
    });
});
