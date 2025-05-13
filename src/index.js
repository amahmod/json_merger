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
async function mergeJsonFiles() {
    try {
        // Ensure input directory exists
        if (!fs.existsSync(argv.input)) {
            console.error(`Error: Input directory "${argv.input}" does not exist`)
            process.exit(1)
        }

        // Create output directory if it doesn't exist
        fs.ensureDirSync(argv.output)

        // Find all JSON files in the input directory
        const jsonFiles = globSync('**/*.json', { cwd: argv.input })

        if (jsonFiles.length === 0) {
            console.error(`Error: No JSON files found in "${argv.input}"`)
            process.exit(1)
        }

        console.log(`Found ${jsonFiles.length} JSON files to merge`)

        // Merge all JSON files
        let mergedData = {}

        for (const file of jsonFiles) {
            const filePath = path.join(argv.input, file)
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8')
                const jsonData = JSON.parse(fileContent)

                // Deep merge the JSON data
                mergedData = deepMerge(mergedData, jsonData)
                console.log(`Merged: ${file}`)
            } catch (err) {
                console.error(`Error processing file ${file}: ${err.message}`)
            }
        }

        // Write the merged JSON to the output file
        const outputFilePath = path.join(argv.output, argv.filename)
        fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2))

        console.log(`Successfully merged ${jsonFiles.length} files into ${outputFilePath}`)
    } catch (err) {
        console.error(`Error: ${err.message}`)
        process.exit(1)
    }
}

// Helper function for deep merging objects
function deepMerge(target, source) {
    const output = { ...target }

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] })
                } else {
                    output[key] = deepMerge(target[key], source[key])
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
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item)
}

// Run the main function
mergeJsonFiles()
