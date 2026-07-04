import * as path from "path"
import * as fs from "fs"
import * as os from "os"
import { Effect, Schema } from "effect"
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js"
import * as Tool from "./tool"
import DESCRIPTION from "./export.txt"
import { InstanceState } from "@/effect/instance-state"
import { assertExternalDirectoryEffect } from "./external-directory"

const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "target",
  "coverage",
  ".turbo",
  ".cache",
  ".venv",
  "venv",
  "__pycache__",
  ".next",
  ".nuxt",
])
const MAX_FILE_SIZE = 25 * 1024 * 1024
const MAX_TOTAL_FILES = 5000

export const Parameters = Schema.Struct({
  directory: Schema.optional(
    Schema.String.annotate({
      description: "Absolute path to the project directory to export. Defaults to the current working directory.",
    }),
  ),
  name: Schema.optional(
    Schema.String.annotate({
      description: "Base name for the exported zip file (without extension). Defaults to the directory's folder name.",
    }),
  ),
})

export const ExportTool = Tool.define(
  "export",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: { directory?: string; name?: string }, ctx: Tool.Context) =>
        Effect.gen(function* () {
          const instance = yield* InstanceState.context
          const targetDir = params.directory
            ? path.isAbsolute(params.directory)
              ? params.directory
              : path.join(instance.directory, params.directory)
            : instance.directory

          yield* assertExternalDirectoryEffect(ctx, targetDir, { kind: "directory" })

          yield* ctx.ask({
            permission: "export",
            patterns: [path.relative(instance.worktree, targetDir) || "."],
            always: ["*"],
            metadata: { directory: targetDir },
          })

          const baseName = (params.name ?? path.basename(targetDir) ?? "project").replace(/[^a-zA-Z0-9_-]+/g, "-")
          const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "")
          const downloadsDir = resolveDownloadsDir()
          const outputPath = path.join(downloadsDir, `${baseName}-${timestamp}.zip`)

          const result = yield* Effect.tryPromise({
            try: () => buildZip(targetDir, outputPath),
            catch: (error) => new Error(`Failed to export project: ${error}`),
          })

          return {
            title: `Exported ${result.fileCount} files to ${path.basename(outputPath)}`,
            metadata: {
              outputPath,
              fileCount: result.fileCount,
              sizeBytes: result.sizeBytes,
            },
            output: [
              "Project exported successfully.",
              "",
              `File: ${outputPath}`,
              `Files included: ${result.fileCount}`,
              `Size: ${(result.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
              "",
              "The zip has been saved to the user's Downloads folder and is ready to share or download.",
            ].join("\n"),
          }
        }).pipe(Effect.orDie),
    }
  }),
)

function resolveDownloadsDir(): string {
  const downloads = path.join(os.homedir(), "Downloads")
  try {
    fs.mkdirSync(downloads, { recursive: true })
    return downloads
  } catch {
    return os.tmpdir()
  }
}

async function buildZip(rootDir: string, outputPath: string) {
  const pending: { relPath: string; data: Buffer }[] = []

  const collect = (current: string, relBase: string) => {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (pending.length >= MAX_TOTAL_FILES) return
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue
        collect(path.join(current, entry.name), path.join(relBase, entry.name))
        continue
      }
      if (!entry.isFile()) continue
      const fullPath = path.join(current, entry.name)
      let stat: fs.Stats
      try {
        stat = fs.statSync(fullPath)
      } catch {
        continue
      }
      if (stat.size > MAX_FILE_SIZE) continue
      const relPath = path.join(relBase, entry.name).split(path.sep).join("/")
      pending.push({ relPath, data: fs.readFileSync(fullPath) })
    }
  }
  collect(rootDir, "")

  const writer = new ZipWriter(new BlobWriter("application/zip"))
  let sizeBytes = 0
  for (const entry of pending) {
    await writer.add(entry.relPath, new BlobReader(new Blob([new Uint8Array(entry.data)])))
    sizeBytes += entry.data.byteLength
  }
  const zip = await writer.close()
  fs.writeFileSync(outputPath, Buffer.from(await zip.arrayBuffer()))

  return { fileCount: pending.length, sizeBytes }
}
