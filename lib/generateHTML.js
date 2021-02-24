const fs = require('fs')
const matter = require('gray-matter')

exports.generateHTML = (path = '') => {
  let fileContents = parseFileContents(path)
  let parsedFile = matter(fileContents)
  return parsedFile.content
}

function parseFileContents(path) {
  try {
    fileContents = fs.readFileSync(path)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(err.message)
    } else {
      throw err
    }
  }
  return fileContents
}
