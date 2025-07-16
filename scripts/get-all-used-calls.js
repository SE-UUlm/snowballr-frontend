/**
 * Script to find all used API calls in the codebase.
 *
 * A list of all API calls made through `backendService` is written to a markdown file.
 *
 * Usage: node get-all-used-calls.js
 */

import fs from "fs";
import path from "path";
import { sync as globSync } from "glob";

// Regular expression to match backendService calls
const apiCallRegex = /backendService\s*\.\s*(\w+)/g;

// Function to remove comments from code
const removeComments = (content) => {
    // Remove single line comments
    content = content.replace(/\/\/.*/g, "");
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, "");
    return content;
};

// Function to read file and find API calls
const findApiCalls = (filePath) => {
    const content = removeComments(fs.readFileSync(filePath, "utf-8"));
    const matches = [...content.matchAll(apiCallRegex)];
    return matches.map((match) => ({
        method: match[1],
        file: filePath,
        line: content.substring(0, match.index).split("\n").length,
    }));
};

// Search all files in src directory
const srcPath = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "src");
const files = globSync(path.join(srcPath, "**/*.{js,ts,svelte}"));

// Collect all API calls
const allCalls = files.flatMap(findApiCalls);

// Group by method name
const groupedCalls = Object.groupBy(allCalls, (call) => call.method);

// Print results
console.log("API Calls Usage:");
Object.entries(groupedCalls).forEach(([method, usages]) => {
    console.log(`\n${method}:`);
    usages.forEach((usage) => {
        console.log(`  ${usage.file}:${usage.line}`);
    });
});

// Print total and distinct counts
const distinctMethodsCount = Object.keys(groupedCalls).length;
const totalCallsCount = Object.values(groupedCalls).reduce((sum, usages) => sum + usages.length, 0);
console.log(`\nTotal API calls found: ${totalCallsCount}`);
console.log(`Total distinct API methods used: ${distinctMethodsCount}`);

// Write methods to markdown file
const methodsList = Object.keys(groupedCalls)
    .sort()
    .map((method) => `- ${method}`)
    .join("\n");
fs.writeFileSync("all-used-calls.md", methodsList);
