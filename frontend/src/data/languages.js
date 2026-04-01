export const languages = [
  { id: "python", name: "Python", monaco: "python" },
  { id: "c", name: "C Programming", monaco: "c" },
  { id: "java", name: "Java", monaco: "java" },
  { id: "cpp", name: "C++", monaco: "cpp" },
  { id: "javascript", name: "JavaScript", monaco: "javascript" },
  { id: "sql", name: "SQL", monaco: "sql" },
  { id: "html", name: "HTML", monaco: "html" },
  { id: "css", name: "CSS", monaco: "css" },
  { id: "csharp", name: "C#", monaco: "csharp" },
  { id: "go", name: "Golang", monaco: "go" },
  { id: "ruby", name: "Ruby", monaco: "ruby" },
  { id: "php", name: "PHP", monaco: "php" },
  { id: "react", name: "React", monaco: "javascript" },
  { id: "typescript", name: "TypeScript", monaco: "typescript" },
  { id: "r", name: "R Programming", monaco: "r" },
  { id: "kotlin", name: "Kotlin", monaco: "kotlin" }
];

export const codeTemplates = {
  python: `def solution(input):
    # write your code here
    pass`,
  javascript: `function solution(input) {
  // write your code here
  return input;
}`,
  java: `class Solution {
    public static String solution(String input) {
        // write your code here
        return input;
    }
}`,
  cpp: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // write your code here
    return input;
}`,
  c: `#include <stdio.h>
#include <string.h>

char* solution(char* input) {
    // write your code here
    return input;
}`,
  kotlin: `fun solution(input: String): String {
    // write your code here
    return input
}`,
  'go': `package main

import "fmt"

func solution(input string) string {
    // write your code here
    return input
}

func main() {
    fmt.Println(solution("test"))
}`,
  rust: `fn solution(input: String) -> String {
    // write your code here
    input
}

fn main() {
    println!("{}", solution("test".to_string()));
}`,
  php: `<?php
function solution($input) {
    // write your code here
    return $input;
}

echo solution("test");
?>`,
  ruby: `def solution(input)
  # write your code here
  input
end

puts solution("test")`,
  typescript: `function solution(input: string): string {
  // write your code here
  return input;
}

console.log(solution("test"));
`,
  csharp: `public class Solution {
    public static string Solution(string input) {
        // write your code here
        return input;
    }
}`,
  sql: `-- Write your SQL query here
SELECT * FROM users;`,
  html: `<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`,
  css: `/* Write your CSS here */
body {
  font-family: Arial, sans-serif;
}`,
  react: `import React from 'react';

const Solution = () => {
  return (
    <div>
      {/* Your React component */}
    </div>
  );
};

export default Solution;`,
  r: `# Write your R code here
result <- "Hello R World"
print(result)`
};

// Default template for unsupported languages
export const defaultTemplate = `// Write your code here
// Selected language: ${language}
console.log("Hello World");`;

