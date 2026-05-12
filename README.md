# Comprehensive Guide to the CyberChef CLI

This guide provides detailed instructions on how to leverage the full power of CyberChef directly from your command line using the `cyberchef-cli.mjs` tool.

> [!IMPORTANT]  
> **Prerequisites:** Before using the CLI, you must ensure the dependencies are installed and the Node API is generated.
> ```powershell
> npm install
> npm run node
> ```

---

## Command Structure

The basic syntax for the CLI tool is:

```bash
node cyberchef-cli.mjs [OPTIONS]
```

### Available Options

*   `-r`, `--recipe` <string>: A comma-separated list of operation names. Use this for simple, argument-less operations.
*   `-rf`, `--recipe-file` <path>: The path to a JSON file containing a complex recipe with specific arguments.
*   `-i`, `--input` <string>: The data you want to process.
*   `-if`, `--input-file` <path>: The path to a file containing the data you want to process.
*   `-h`, `--help`: Displays the help menu.

---

## 1. Handling Input

The CLI is designed to be flexible with how it receives data, making it easy to integrate into your existing terminal workflows.

### A. Direct String Input
Use the `-i` flag to pass data directly.

```bash
node cyberchef-cli.mjs -r "MD5" -i "secret_password"
```

### B. File Input
Use the `-if` flag to read data from a file. This is ideal for large datasets or binary files.

```bash
node cyberchef-cli.mjs -r "Entropy" -if ./malware_sample.exe
```

### C. Standard Input (Piping)
If you don't provide `-i` or `-if`, the CLI will automatically read from `stdin`. This allows you to chain CyberChef with other command-line tools.

```bash
cat access.log | node cyberchef-cli.mjs -r "Extract IP addresses, Unique"
```

```bash
echo "Hello World" | node cyberchef-cli.mjs -r "To Base64"
```

---

## 2. Defining Recipes

A "Recipe" in CyberChef is a sequence of operations. You can define them in two ways:

### A. Simple Comma-Separated Strings (`-r`)
For operations that don't require complex configuration, you can just list their names.

```bash
# Convert to Base64, then reverse the string
node cyberchef-cli.mjs -r "To Base64, Reverse" -i "Antigravity"
```

> [!TIP]
> The operation names are case-insensitive and ignore spaces, but it's best to match the names as they appear in the web UI (e.g., "To Base64", "MD5", "Hex to PEM").

### B. Complex JSON Recipes (`-rf`)
Many CyberChef operations require specific arguments (e.g., providing a key for AES decryption, or specifying the output format for a hash). For these, you must use a JSON file.

**Format of the JSON file:**
It must be a JSON array of objects. Each object represents an operation and must have an `"op"` (operation name) and `"args"` (an array of arguments in the exact order the operation expects them).

**Example: `recipe.json`**
```json
[
  { 
    "op": "AES Decrypt", 
    "args": [
      {"string": "mysecretkey12345", "option": "UTF8"}, 
      {"string": "myiv678901234567", "option": "UTF8"}, 
      "CBC", 
      "Raw", 
      "Raw", 
      {"string": "", "option": "Hex"}
    ] 
  },
  { 
    "op": "To Hexdump", 
    "args": [16, false, false, false] 
  }
]
```

**Running the JSON recipe:**
```bash
node cyberchef-cli.mjs -rf recipe.json -if encrypted_data.bin
```

---

## 3. Practical Examples

Here are some real-world scenarios demonstrating the CLI's capabilities.

### Example 1: Extracting and Decoding URLs from a File
Suppose you have a text file (`suspicious.txt`) containing obfuscated URLs.

```bash
node cyberchef-cli.mjs -r "Extract URLs, URL Decode" -if suspicious.txt
```

### Example 2: Analyzing a File's Hashes
Quickly generate multiple hashes for a specific file.

```bash
node cyberchef-cli.mjs -r "Generate all hashes" -if downloaded_file.zip
```

### Example 3: Magic Decoding
Let CyberChef attempt to automatically determine how a string is encoded and decode it.

```bash
node cyberchef-cli.mjs -r "Magic" -i "V0hBVCBJUyBUSElTPw=="
```

### Example 4: Formatting JSON
If you have an unformatted API response in a file:

```bash
node cyberchef-cli.mjs -r "JSON Beautify" -if api_response.txt
```

---

## Troubleshooting

> [!WARNING]
> **Error: "Cannot find module '.../src/node/index.mjs'"**
> This means the Node API hasn't been built. Run `npm run node` in the project root.

> [!WARNING]
> **Error: "Couldn't find an operation with name..."**
> Ensure you are spelling the operation correctly as it appears in CyberChef.

> [!NOTE]
> Flow Control operations (like "Fork", "Merge", "Jump") are generally not supported in the standalone Node API / CLI environment in the same way they are in the browser UI. Avoid using them in complex CLI recipes.
