export const codeTemplates = {
  javascript: `function solution(input) {
  // write your code here
  return input.length;
}`,
  
  python: `def solution(input):
    # write your code here
    return len(input)
    
print(solution("hello"))`,
  
  java: `class Solution {
    public static int solution(String input) {
        // write your code here
        return input.length();
    }
    
    public static void main(String[] args) {
        System.out.println(solution("hello"));
    }
}`,
  
  cpp: `#include <iostream>
#include <string>
using namespace std;

int solution(string input) {
    // write your code here
    return input.length();
}

int main() {
    string input = "hello";
    cout << solution(input) << endl;
    return 0;
}`,
  
  kotlin: `fun solution(input: String): Int {
    // write your code here
    return input.length
}

fun main() {
    println(solution("hello"))
}`,
  
  'go': `package main

import "fmt"

func solution(input string) int {
    // write your code here
    return len(input)
}

func main() {
    fmt.Println(solution("hello"))
}`,
  
  rust: `fn solution(input: String) -> i32 {
    // write your code here
    input.len() as i32
}

fn main() {
    println!("{}", solution("hello".to_string()));
}`,
  
  typescript: `function solution(input: string): number {
  // write your code here
  return input.length;
}

console.log(solution("hello"));
`
};

export const languages = [
  { id: 'javascript', name: 'JavaScript', monaco: 'javascript' },
  { id: 'python', name: 'Python 3', monaco: 'python' },
  { id: 'java', name: 'Java 17', monaco: 'java' },
  { id: 'cpp', name: 'C++17', monaco: 'cpp' },
  { id: 'kotlin', name: 'Kotlin', monaco: 'kotlin' },
  { id: 'go', name: 'Go', monaco: 'go' },
  { id: 'rust', name: 'Rust', monaco: 'rust' },
  { id: 'typescript', name: 'TypeScript', monaco: 'typescript' }
];

export const judge0LanguageIds = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  kotlin: 78,
  'go': 80,
  rust: 73,
  typescript: 178
};

