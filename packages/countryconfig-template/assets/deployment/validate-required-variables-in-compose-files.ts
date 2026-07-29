import * as fs from 'fs'
import { basename } from 'path'

function extractEnvVars(content: string): string[] {
  const regex = /(?<!\$)\$\{(.*?)\}/g
  let match: RegExpExecArray | null
  const envVars: Set<string> = new Set()

  while ((match = regex.exec(content)) !== null) {
    envVars.add(match[1])
  }

  return Array.from(envVars)
}

function getAllVariableNames(filePaths: string[]) {
  const allVars = new Set<string>()
  filePaths.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    const envVars = extractEnvVars(content)
    envVars.forEach((envVar) => allVars.add(envVar))
  })
  return Array.from(allVars)
}

// Main function to start the process
function main(): void {
  // Taking file paths from command line arguments
  const filePaths = process.argv.slice(2)
  if (filePaths.length === 0) {
    console.error('Please provide YAML file paths as arguments.')
    process.exit(1)
  }

  const requiredValues = getAllVariableNames(filePaths).filter(
    (name) => !name.includes(':-')
  )

  const missingValues = requiredValues.filter((name) => !process.env[name])

  if (missingValues.length > 0) {
    console.log('\n\n')
    console.error(
      'Missing secrets or variables for values found in docker compose files:'
    )
    console.error(missingValues)
    console.error(
      '\nCheck the following files for more details:\n',
      filePaths.map((path) => `- ${basename(path)}`).join('\n')
    )
    console.log('\n')
    process.exit(1)
  }
}

main()
