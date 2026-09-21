import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { canonicalJson, canonicalSha256, checkCaptureBindings, checkCaptureByteClosure,
  parseJsonStrict, validate, type CapturedFile, type Coverage, type EvidenceLocator,
  type SourceCapture } from '@context-foundry/contracts';
import { checkExtensionHandshake, checkExtensionRecords, type AdapterManifest, type ExtensionConsumer,
  type ExtensionRecord, type InstalledProfiles } from '@context-foundry/contracts/extensions';

export type ApprovedCapture = {
  capture: SourceCapture;
  files: readonly CapturedFile[];
  supplied: readonly { path: string; bytes: Uint8Array }[];
};
export type ProducerJob = {
  job_id: string;
  capture: ApprovedCapture;
  manifest: AdapterManifest;
  consumer: ExtensionConsumer;
  installed: InstalledProfiles;
  executable: string;
  argv: readonly string[];
  signal?: AbortSignal;
};
export type Diagnostic = { code: string; path: string };
export type ProducerCandidate = {
  records: readonly ExtensionRecord[];
  locators: readonly EvidenceLocator[];
  coverage: readonly Coverage[];
  diagnostics: readonly Diagnostic[];
  digest: string;
  input_digest: string;
};
export type ProducerResult =
  | { ok: true; candidate: ProducerCandidate }
  | { ok: false; code: 'INVALID_INPUT' | 'CAPTURE_BYTES_CHANGED' | 'SPAWN_FAILED' |
      'TIMEOUT' | 'CANCELLED' | 'OUTPUT_LIMIT' | 'INVALID_STREAM' |
      'ADAPTER_FAILED' | 'INVALID_CANDIDATE' };

const MAX_FILES = 100;
const MAX_TOTAL_BYTES = 16 * 1024 * 1024;

type OutputMessage = Record<string, unknown>;
const digestBytes = (value: Uint8Array): string => createHash('sha256').update(value).digest('hex');

/** Reviewed-adapter offline runner. A child process is not an untrusted-code sandbox. */
export async function runProducerJob(job: ProducerJob): Promise<ProducerResult> {
  if (job.signal?.aborted) return { ok: false, code: 'CANCELLED' };
  const { capture, files, supplied } = job.capture;
  if (!job.job_id || job.job_id.length > 512 || !job.executable || job.argv.length > 16 ||
    job.argv.some(arg => arg.length > 4096) || !validate('source_capture', capture) ||
    files.length > MAX_FILES || supplied.length > MAX_FILES ||
    supplied.some(item => !(item.bytes instanceof Uint8Array)) ||
    supplied.reduce((sum, item) => sum + item.bytes.byteLength, 0) > MAX_TOTAL_BYTES ||
    job.manifest.schema_version !== '0.3.0' || job.manifest.protocol_major !== 1) {
    return { ok: false, code: 'INVALID_INPUT' };
  }
  if (checkCaptureByteClosure(capture, files, supplied).issues.length) {
    return { ok: false, code: 'CAPTURE_BYTES_CHANGED' };
  }
  if (checkExtensionHandshake(job.manifest, job.consumer, job.installed).length) {
    return { ok: false, code: 'INVALID_INPUT' };
  }
  const ordered = [...supplied].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const orderedFiles = [...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const inputDigest = canonicalSha256({ capture, files: orderedFiles,
    file_digests: ordered.map(item => [item.path, digestBytes(item.bytes)]) });
  let input: string;
  try {
    input = [
      canonicalJson({ type: 'job', protocol_major: 1, job_id: job.job_id,
        capture, files: orderedFiles, input_digest: inputDigest,
        profile_digests: job.manifest.emitted_profiles }),
      ...ordered.map(item => canonicalJson({ type: 'file', path: item.path,
        bytes_base64: Buffer.from(item.bytes).toString('base64') })),
      canonicalJson({ type: 'end_input' }),
    ].join('\n') + '\n';
  } catch { return { ok: false, code: 'INVALID_INPUT' }; }
  if (Buffer.byteLength(input) > job.manifest.resource_limits.input_bytes) {
    return { ok: false, code: 'INVALID_INPUT' };
  }

  const output = await new Promise<{ code: string; stdout: Buffer }>(resolve => {
    let settled = false;
    let onAbort: (() => void) | undefined;
    const finish = (code: string, stdout = Buffer.alloc(0)): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (onAbort) job.signal?.removeEventListener('abort', onAbort);
      resolve({ code, stdout });
    };
    let child;
    try {
      child = spawn(job.executable, [...job.argv], {
        shell: false, stdio: ['pipe', 'pipe', 'pipe'],
        env: { PATH: '/usr/bin:/bin', LANG: 'C.UTF-8', PYTHONNOUSERSITE: '1' },
      });
    } catch { resolve({ code: 'SPAWN_FAILED', stdout: Buffer.alloc(0) }); return; }
    const timer = setTimeout(() => { child.kill('SIGKILL'); finish('TIMEOUT'); },
      job.manifest.resource_limits.wall_ms);
    onAbort = () => { child.kill('SIGKILL'); finish('CANCELLED'); };
    job.signal?.addEventListener('abort', onAbort, { once: true });
    if (job.signal?.aborted) onAbort();
    const chunks: Buffer[] = [];
    let bytes = 0;
    let stderrBytes = 0;
    child.stdout.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > job.manifest.resource_limits.output_bytes) {
        child.kill('SIGKILL'); finish('OUTPUT_LIMIT'); return;
      }
      chunks.push(chunk);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderrBytes += chunk.length;
      if (stderrBytes > 16 * 1024) { child.kill('SIGKILL'); finish('OUTPUT_LIMIT'); }
    });
    child.on('error', () => finish('SPAWN_FAILED'));
    child.on('close', code => finish(code === 0 ? 'OK' : 'ADAPTER_FAILED', Buffer.concat(chunks)));
    child.stdin.on('error', () => { /* early adapter exit is resolved by close */ });
    child.stdin.end(input);
  });
  if (output.code !== 'OK') return { ok: false, code: output.code as Extract<ProducerResult, {ok:false}>['code'] };
  let messages: OutputMessage[];
  try {
    const stdout = new TextDecoder('utf-8', { fatal: true }).decode(output.stdout);
    if (!stdout.endsWith('\n')) throw new Error('missing LF');
    const lines = stdout.slice(0, -1).split('\n');
    if (lines.length > job.manifest.resource_limits.messages) throw new Error('message limit');
    messages = lines.map(line => {
      const parsed = parseJsonStrict(line);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
        canonicalJson(parsed) !== line) throw new Error('noncanonical message');
      return parsed as OutputMessage;
    });
  } catch { return { ok: false, code: 'INVALID_STREAM' }; }
  const header = messages.shift();
  const end = messages.pop();
  if (!header || header['type'] !== 'result' || header['protocol_major'] !== 1 ||
    header['job_id'] !== job.job_id || header['adapter_id'] !== job.manifest.adapter_id ||
    header['input_digest'] !== inputDigest || !end || end['type'] !== 'end_result') {
    return { ok: false, code: 'INVALID_STREAM' };
  }
  const records: ExtensionRecord[] = [];
  const locators: EvidenceLocator[] = [];
  const coverage: Coverage[] = [];
  const diagnostics: Diagnostic[] = [];
  try {
    let phase = 0;
    for (const message of messages) {
      const type = message['type'];
      const currentPhase = type === 'locator' ? 0 : type === 'record' ? 1 :
        type === 'coverage' ? 2 : type === 'diagnostic' ? 3 : -1;
      if (currentPhase < phase || currentPhase < 0 || Object.keys(message).length !== 2 ||
        !('value' in message)) throw new Error('unexpected message');
      phase = currentPhase;
      if (type === 'locator') locators.push(message['value'] as EvidenceLocator);
      if (type === 'record') records.push(message['value'] as ExtensionRecord);
      if (type === 'coverage') coverage.push(message['value'] as Coverage);
      if (type === 'diagnostic') diagnostics.push(message['value'] as Diagnostic);
    }
    const counts = { locators: locators.length, records: records.length,
      coverage: coverage.length, diagnostics: diagnostics.length };
    if (canonicalJson(end['counts']) !== canonicalJson(counts) ||
      end['content_digest'] !== canonicalSha256({ locators, records, coverage, diagnostics })) {
      throw new Error('completion mismatch');
    }
  } catch { return { ok: false, code: 'INVALID_STREAM' }; }
  if (checkCaptureBindings([capture], files, locators).length ||
    !coverage.length ||
    coverage.some(item => !validate('coverage', item) || item.source_id !== capture.source_id ||
      item.capture_digest !== canonicalSha256(capture) || item.adapter_id !== job.manifest.adapter_id) ||
    diagnostics.some(item => !item || typeof item.code !== 'string' || typeof item.path !== 'string') ||
    checkExtensionRecords(records, locators, job.manifest, job.consumer, job.installed).issues.length) {
    return { ok: false, code: 'INVALID_CANDIDATE' };
  }
  return { ok: true, candidate: {
    records, locators, coverage, diagnostics,
    digest: canonicalSha256({ capture, files: orderedFiles, locators, records, coverage, diagnostics }),
    input_digest: inputDigest,
  } };
}
