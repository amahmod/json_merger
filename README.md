# JSON Merger

A command-line tool to merge multiple JSON files into a single JSON file.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/json_merger.git
cd json_merger

# Install dependencies
npm install

# Make the tool executable (optional)
npm link
```

## Usage

```bash
# Using npm with default directories (input and output)
npm start

# Using npm with custom directories
npm start -- --input=./input-directory --output=./output-directory

# If linked (optional) with default directories
json_merger

# If linked with custom directories
json_merger --input=./input-directory --output=./output-directory
```

### Options

-   `--input`, `-i`: Input directory containing JSON files to merge (default: "./input")
-   `--output`, `-o`: Output directory for merged JSON file (default: "./output")
-   `--filename`, `-f`: Name of the output file (default: "merged.json")
-   `--help`, `-h`: Show help

## Examples

```bash
# Use default directories (./input and ./output)
npm start

# Merge all JSON files from ./input into ./output/merged.json
npm start -- --input=./input --output=./output

# Specify a custom output filename
npm start -- --input=./input --output=./output --filename=combined.json
```

## How It Works

The tool:

1. Reads all JSON files from the input directory
2. Deep merges them into a single object
3. Writes the merged data to the specified output directory

During merging:

-   Objects are deeply merged
-   Arrays are concatenated
-   Primitive values from later files overwrite earlier ones
