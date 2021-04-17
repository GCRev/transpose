import fs, { promises as fsp } from 'fs'
import path from 'path'

/* 
 * read through a src directory and transpile all files
 * recursively to an output directory structure
 */

/* 
 * argv[0] and argv[1] are the node executable and the current directory
 * respectively. Ignore these two parameters
 */
const [ ,, processPath = path.resolve('./code'), outputPath = path.resolve('./transposed') ] = process.argv

async function getFiles(filePath, files = []) {
  const newFiles = await fsp.readdir(filePath, { withFileTypes: true })
  const dirs = []
  for (const file of newFiles) {
    if (file.name.includes('node_module') || file.name.startsWith('.')) { continue }
    file.isFile() && files.push(path.resolve(filePath, file.name))
    file.isDirectory() && dirs.push(path.resolve(filePath, file.name))
  }
  await Promise.all(dirs.map(dirPath => getFiles(dirPath, files)))
}

const nlCode = '\n'.charCodeAt()

async function processFile(inputPath, outputPath) {

  /* ensure that the file path to the output file exists */
  const { dir } = path.parse(outputPath)
  await fsp.mkdir(dir, { recursive: true })

  return new Promise(resolve => {
    const readStream = fs.createReadStream(inputPath)
    const writeStream = fs.createWriteStream(outputPath)
    /* 
     * there really isn't any other way to do this besides reading the entire
     * file in to memory and then processing that. I would be possible to
     * re-read the file over and over, but that would take extremely long for
     * large files
     */
    const lines = []
    let maxLineLength = 0

    let lineBuffer = ''
    readStream.on('data', chunk => {
      for (const code of chunk) {
        if (code !== nlCode) {
          lineBuffer += String.fromCharCode(code)
        } else {
          lines.push(lineBuffer)
          maxLineLength = Math.max(maxLineLength, lineBuffer.length)
          lineBuffer = ''
        }
      }
    })

    readStream.on('end', () => {
      if (lineBuffer) {
        lines.push(lineBuffer)
      }

      /* index over by one column */
      for (let a = 0; a < maxLineLength; a++) {
        lineBuffer = ''
        for (const line of lines) {
          if (a < line.length) { 
            let char = line[a]

            /* carriage-returns must be converted to spaces */
            if (char === '\r') char = ' '
            lineBuffer += char 
          }
          else { lineBuffer += ' ' }
        }
        lineBuffer += '\n'
        writeStream.write(lineBuffer)
      }
      writeStream.end()
      resolve()
    })
  })
}

async function transpose() {
  try {
    const resolvedPath = path.resolve(processPath)
    const resolvedOutputPath = path.resolve(outputPath)
    console.log(`transpiling from "${resolvedPath}"`)
    console.log(`to "${resolvedOutputPath}"`)
    const files = []
    await getFiles(resolvedPath, files)
    console.dir(files)
    await Promise.all(files.map(file => processFile(file, path.resolve(resolvedOutputPath, `${path.relative(processPath, file)}.tran`))))
    console.log('done')
  } catch (err) {
    console.dir(err)
  }
}

transpose()

export default transpose
