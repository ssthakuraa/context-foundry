import { constants } from 'node:fs';
import { open, realpath, type FileHandle } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import {
  checkCaptureBindings, checkCaptureByteClosure, type CapturedFile, type SourceCapture,
} from '@context-foundry/contracts';
import { assembleTypeScriptCandidate, type CandidateResult } from './candidate.js';

const MAX_FILES = 100;
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_TOTAL_BYTES = 16 * 1024 * 1024;
const BLOCKED_SEGMENTS = new Set([
  '.git', '.local', 'node_modules', 'dist', 'build', 'coverage',
  'secrets', 'secret', 'credentials', 'credential', 'private',
]);
const SENSITIVE_NAME = /(?:^|[-_.])(?:secret|secrets|credential|credentials|password|passwd|token|api[-_]?key|private[-_]?key)(?:[-_.]|$)/i;

export type LocalReadCode =
  | 'INVALID_SCOPE' | 'UNSUPPORTED_HOST' | 'UNSAFE_PATH' | 'MISSING_FILE'
  | 'NOT_REGULAR' | 'SOURCE_TOO_LARGE' | 'SOURCE_CHANGED' | 'IO_ERROR';
export type LocalReadResult =
  | { ok: false; code: LocalReadCode; path?: string }
  | { ok: true; supplied: readonly { path: string; bytes: Uint8Array }[] };

type ReadFailure = { code: LocalReadCode; path?: string };

function readFailure(code: LocalReadCode, path?: string): ReadFailure {
  return { code, ...(path === undefined ? {} : { path }) };
}

function safePath(path: string): boolean {
  if (!path.endsWith('.ts')) return false;
  const segments = path.split('/');
  return segments.every(segment => segment && segment !== '.' && segment !== '..' &&
    !segment.startsWith('.') && !BLOCKED_SEGMENTS.has(segment.toLowerCase()) &&
    !SENSITIVE_NAME.test(segment));
}

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code) : undefined;
}

/** Open each component beneath the already-open root directory descriptor.
 * Linux /proc/self/fd and O_NOFOLLOW are required; there is no path-based fallback. */
async function readOne(root: FileHandle, path: string): Promise<Uint8Array | ReadFailure> {
  const segments = path.split('/');
  const opened: FileHandle[] = [];
  try {
    let parent = root;
    for (const segment of segments.slice(0, -1)) {
      const directory = await open(`/proc/self/fd/${parent.fd}/${segment}`,
        constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
      opened.push(directory);
      parent = directory;
    }
    const file = await open(`/proc/self/fd/${parent.fd}/${segments.at(-1)!}`,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    opened.push(file);
    const before = await file.stat({ bigint: true });
    if (!before.isFile() || before.nlink !== 1n) return readFailure('NOT_REGULAR', path);
    if (before.size > BigInt(MAX_FILE_BYTES)) return readFailure('SOURCE_TOO_LARGE', path);
    const bytes = Buffer.alloc(Number(before.size));
    let offset = 0;
    while (offset < bytes.length) {
      const { bytesRead } = await file.read(bytes, offset, bytes.length - offset, offset);
      if (!bytesRead) return readFailure('SOURCE_CHANGED', path);
      offset += bytesRead;
    }
    const extra = Buffer.alloc(1);
    if ((await file.read(extra, 0, 1, bytes.length)).bytesRead) {
      return readFailure('SOURCE_CHANGED', path);
    }
    const after = await file.stat({ bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) {
      return readFailure('SOURCE_CHANGED', path);
    }
    return bytes;
  } catch (error) {
    const code = errorCode(error);
    if (code === 'ENOENT') return readFailure('MISSING_FILE', path);
    if (code === 'ELOOP' || code === 'ENOTDIR' || code === 'EACCES') {
      return readFailure('UNSAFE_PATH', path);
    }
    if (code === 'ENOSYS') return readFailure('UNSUPPORTED_HOST');
    return readFailure('IO_ERROR', path);
  } finally {
    await Promise.all(opened.reverse().map(handle => handle.close()));
  }
}

/** Read only a caller-declared, metadata-bound TypeScript file list under one root.
 * This is local single-operator acquisition, not source-control or user authorization. */
export async function readBoundLocalCapture(
  rootPath: string,
  capture: SourceCapture,
  files: readonly CapturedFile[],
): Promise<LocalReadResult> {
  if (process.platform !== 'linux' || !isAbsolute(rootPath)) {
    return { ok: false, code: 'UNSUPPORTED_HOST' };
  }
  if (!files.length || files.length > MAX_FILES || checkCaptureBindings([capture], files, []).length ||
    files.some(file => !safePath(file.path) || file.bytes > MAX_FILE_BYTES) ||
    files.reduce((sum, file) => sum + file.bytes, 0) > MAX_TOTAL_BYTES) {
    return { ok: false, code: 'INVALID_SCOPE' };
  }
  let root: FileHandle;
  try {
    const canonicalRoot = await realpath(rootPath);
    root = await open(canonicalRoot,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  } catch {
    return { ok: false, code: 'INVALID_SCOPE' };
  }
  try {
    const supplied: { path: string; bytes: Uint8Array }[] = [];
    for (const file of files) {
      const result = await readOne(root, file.path);
      if (!(result instanceof Uint8Array)) return { ok: false, ...result };
      supplied.push({ path: file.path, bytes: result });
    }
    if (checkCaptureByteClosure(capture, files, supplied).issues.length) {
      return { ok: false, code: 'SOURCE_CHANGED' };
    }
    return { ok: true, supplied };
  } finally {
    await root.close();
  }
}

/** Local-only proof path. No API, directory scan, publication or approval occurs. */
export async function assembleLocalTypeScriptCandidate(
  rootPath: string,
  capture: SourceCapture,
  files: readonly CapturedFile[],
): Promise<Extract<LocalReadResult, { ok: false }> | CandidateResult> {
  const read = await readBoundLocalCapture(rootPath, capture, files);
  return read.ok ? assembleTypeScriptCandidate({ capture, files, supplied: read.supplied }) : read;
}
