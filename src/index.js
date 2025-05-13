#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const { globSync } = require('glob')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('input', {
        alias: 'i',
        description: 'Input directory containing JSON files to merge',
        type: 'string',
        default: './input',
    })
    .option('output', {
        alias: 'o',
        description: 'Output directory for merged JSON file',
        type: 'string',
        default: './output',
    })
    .option('filename', {
        alias: 'f',
        description: 'Name of the output file',
        type: 'string',
        default: 'merged.json',
    })
    .help()
    .alias('help', 'h').argv

// Function to merge JSON files
async function merge_json_files() {
    try {
        // Ensure input directory exists
        if (!fs.existsSync(argv.input)) {
            console.error(`Error: Input directory "${argv.input}" does not exist`)
            process.exit(1)
        }

        // Create output directory if it doesn't exist
        fs.ensureDirSync(argv.output)

        // Find all JSON files in the input directory
        const json_files = globSync('**/*.json', { cwd: argv.input })

        if (json_files.length === 0) {
            console.error(`Error: No JSON files found in "${argv.input}"`)
            process.exit(1)
        }

        console.log(`Found ${json_files.length} JSON files to merge`)

        // Merge all JSON files
        let merged_data = {}

        for (const file of json_files) {
            const file_path = path.join(argv.input, file)
            try {
                const file_content = fs.readFileSync(file_path, 'utf8')
                const json_data = JSON.parse(file_content)

                // Deep merge the JSON data
                merged_data = deep_merge(merged_data, json_data)
                console.log(`Merged: ${file}`)
            } catch (err) {
                console.error(`Error processing file ${file}: ${err.message}`)
            }
        }

        // Write the merged JSON to the output file
        const output_file_path = path.join(argv.output, argv.filename)
        fs.writeFileSync(output_file_path, JSON.stringify(merged_data, null, 2))

        console.log(`Successfully merged ${json_files.length} files into ${output_file_path}`)
    } catch (err) {
        console.error(`Error: ${err.message}`)
        process.exit(1)
    }
}

// Helper function for deep merging objects
function deep_merge(target, source) {
    const output = { ...target }

    if (is_object(target) && is_object(source)) {
        Object.keys(source).forEach(key => {
            if (is_object(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] })
                } else {
                    output[key] = deep_merge(target[key], source[key])
                }
            } else if (Array.isArray(source[key])) {
                if (Array.isArray(target[key])) {
                    // Combine arrays
                    output[key] = [...target[key], ...source[key]]
                } else {
                    output[key] = source[key]
                }
            } else {
                Object.assign(output, { [key]: source[key] })
            }
        })
    }

    return output
}

// Helper to check if value is an object
function is_object(item) {
    return item && typeof item === 'object' && !Array.isArray(item)
}

// Run the main function
merge_json_files()
