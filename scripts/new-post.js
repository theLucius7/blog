/* This is a script to create a new post markdown file with front-matter */

import fs from "fs"
import path from "path"

function getDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const args = process.argv.slice(2)
const usage = "Usage: pnpm new-post <filename>"

if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
  console.log(usage)
  process.exit(0)
}

if (args.length !== 1 || !args[0].trim()) {
  console.error(`Error: Provide one filename\n${usage}`)
  process.exit(1)
}

try {
  let fileName = args[0]

  if (
    path.isAbsolute(fileName) ||
    path.win32.parse(fileName).root !== "" ||
    fileName.includes("\\") ||
    fileName.split("/").includes("..") ||
    fileName.endsWith("/") ||
    [".", ".."].includes(path.basename(fileName))
  ) {
    throw new Error("Use a relative post path inside src/content/posts")
  }

  const extension = path.extname(fileName)
  if (extension && extension !== ".md") {
    throw new Error("Only .md files are supported")
  }
  if (!extension) fileName += ".md"

  const targetDir = path.resolve("src/content/posts")
  const fullPath = path.resolve(targetDir, fileName)
  const relativePath = path.relative(targetDir, fullPath)
  if (relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    throw new Error("Post paths must stay inside src/content/posts")
  }

  fs.mkdirSync(targetDir, { recursive: true })
  // Reject existing symlinks before creating any directories through them.
  let dirPath = targetDir
  const directories = [targetDir]
  for (const segment of path.relative(targetDir, path.dirname(fullPath)).split(path.sep).filter(Boolean)) {
    dirPath = path.join(dirPath, segment)
    directories.push(dirPath)
  }
  for (const directory of directories) {
    if (!fs.existsSync(directory)) fs.mkdirSync(directory)
    const stats = fs.lstatSync(directory)
    if (stats.isSymbolicLink() || !stats.isDirectory()) {
      throw new Error(`Post directories must not be symlinks: ${directory}`)
    }
  }

  const content = `---
title: ${JSON.stringify(args[0])}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ''
draft: true
lang: zh_CN
---
`

  // Exclusive creation also rejects existing files and dangling symlinks.
  fs.writeFileSync(fullPath, content, { flag: "wx" })

  console.log(`Post ${fullPath} created`)
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
