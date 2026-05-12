#!/usr/bin/env node

/**
 * CyberChef CLI
 * 
 * Usage:
 *   node cyberchef-cli.mjs --recipe "To Base64,To Hex" --input "hello world"
 *   echo "hello world" | node cyberchef-cli.mjs --recipe "To Base64"
 *   node cyberchef-cli.mjs --recipe-file recipe.json --input-file input.txt
 * 
 * @author Antigravity AI
 * @license Apache-2.0
 */

import chef from "./src/node/index.mjs";
import fs from "fs";

async function main() {
    const args = process.argv.slice(2);
    let recipeStr = "";
    let recipeFile = "";
    let inputStr = "";
    let inputFile = "";
    let help = false;

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--recipe":
            case "-r":
                recipeStr = args[++i];
                break;
            case "--recipe-file":
            case "-rf":
                recipeFile = args[++i];
                break;
            case "--input":
            case "-i":
                inputStr = args[++i];
                break;
            case "--input-file":
            case "-if":
                inputFile = args[++i];
                break;
            case "--help":
            case "-h":
                help = true;
                break;
        }
    }

    if (help || (!recipeStr && !recipeFile)) {
        console.log(`
CyberChef CLI - The Cyber Swiss Army Knife for the terminal

Usage:
  node cyberchef-cli.mjs -r "To Base64,To Hex" -i "hello"
  node cyberchef-cli.mjs -rf recipe.json -if input.txt
  echo "hello" | node cyberchef-cli.mjs -r "To Base64"

Options:
  -r,  --recipe        Comma-separated list of operation names (e.g. "To Base64, To Hex")
  -rf, --recipe-file   Path to a JSON file containing the recipe configuration
  -i,  --input         Input string
  -if, --input-file    Path to an input file
  -h,  --help          Show this help message

Examples:
  node cyberchef-cli.mjs -r "To Base64" -i "Antigravity"
  node cyberchef-cli.mjs -r "To Hex, Reverse" -i "12345"
`);
        return;
    }

    let recipeConfig;
    if (recipeFile) {
        try {
            recipeConfig = JSON.parse(fs.readFileSync(recipeFile, "utf-8"));
        } catch (e) {
            console.error("Error reading recipe file:", e.message);
            process.exit(1);
        }
    } else {
        // Simple comma-separated list of operation names
        recipeConfig = recipeStr.split(",").map(name => {
            const trimmed = name.trim();
            // Handle cases where user might have added parentheses like "To Base64()"
            return trimmed.endsWith("()") ? trimmed.slice(0, -2) : trimmed;
        });
    }

    let input;
    if (inputFile) {
        try {
            input = fs.readFileSync(inputFile);
        } catch (e) {
            console.error("Error reading input file:", e.message);
            process.exit(1);
        }
    } else if (inputStr) {
        input = inputStr;
    } else {
        // Read from stdin if no input provided via arguments
        try {
            input = fs.readFileSync(0);
        } catch (e) {
            // If stdin is empty or not available
            input = "";
        }
    }

    try {
        const output = await chef.bake(input, recipeConfig);
        
        // Output the result to stdout
        if (output.value instanceof ArrayBuffer) {
            process.stdout.write(Buffer.from(output.value));
        } else if (Buffer.isBuffer(output.value)) {
            process.stdout.write(output.value);
        } else if (typeof output.value === "string") {
            process.stdout.write(output.value);
        } else {
            process.stdout.write(String(output.value));
        }
        
        // Add a newline if it's a string and doesn't end with one
        if (typeof output.value === "string" && !output.value.endsWith("\n")) {
            // console.log(""); // This would add an extra newline, maybe not desired for pipe
        }
    } catch (e) {
        console.error("Error executing recipe:", e.message);
        process.exit(1);
    }
}

main();
