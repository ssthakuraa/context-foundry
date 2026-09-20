import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { link, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { CONTRACT_VERSION, fileManifestDigest, type CapturedFile, type SourceCapture,
} from '@context-foundry/contracts';
import { assembleLocalTypeScriptCandidate, readBoundLocalCapture } from '../src/local-read.js';

function metadata(entries: readonly { path: string; bytes: Uint8Array }[]) {
  const files: CapturedFile[] = entries.map(({ path, bytes }) => ({
    schema_version: CONTRACT_VERSION, source_id: 'repo:synthetic', snapshot_id: 'snap:local',
    path, file_digest: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.byteLength, media_kind: 'text/typescript', language_kind: 'typescript',
    classification: 'internal',
  }));
  const capture: SourceCapture = {
    schema_version: CONTRACT_VERSION, capture_id: 'capture:local',
    source_id: 'repo:synthetic', authority_id: 'team:synthetic', snapshot_id: 'snap:local',
    revision_kind: 'supplied_snapshot', captured_at: '2026-09-20T00:00:00Z',
    file_manifest_digest: fileManifestDigest(files), publication_policy_ref: 'policy:local-only',
    capture_producer_id: 'producer:local-test', capture_policy: 'metadata_only',
    classification: 'internal',
  };
  return { capture, files };
}

const encoded = (text: string) => new TextEncoder().encode(text);

test('explicit regular files produce a local candidate without scanning siblings', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cf-local-read-'));
  try {
    await mkdir(join(root, 'src'));
    const a = encoded('export class A {}');
    const b = encoded('export function b(): void { throw new Error("not executed"); }');
    await writeFile(join(root, 'src/a.ts'), a);
    await writeFile(join(root, 'src/b.ts'), b);
    await writeFile(join(root, 'src/unselected.ts'), encoded('export class Secret {}'));
    const { capture, files } = metadata([
      { path: 'src/a.ts', bytes: a }, { path: 'src/b.ts', bytes: b },
    ]);
    const read = await readBoundLocalCapture(root, capture, files);
    assert.equal(read.ok, true);
    if (read.ok) assert.deepEqual(read.supplied.map(item => item.path), ['src/a.ts', 'src/b.ts']);
    const candidate = await assembleLocalTypeScriptCandidate(root, capture, files);
    assert.equal(candidate.ok, true);
    assert.equal('records' in candidate, true);
    if (candidate.ok && 'records' in candidate) {
      assert.deepEqual(candidate.records.map(record => record.payload['name']), ['A', 'b']);
      assert.equal(candidate.coverage.eligible_count, 2);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('symlink components, hard links and changed content fail closed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cf-local-read-'));
  const outside = await mkdtemp(join(tmpdir(), 'cf-local-outside-'));
  try {
    await mkdir(join(root, 'src'));
    const bytes = encoded('export class Allowed {}');
    await writeFile(join(root, 'src/allowed.ts'), bytes);
    await writeFile(join(outside, 'outside.ts'), bytes);
    await symlink(outside, join(root, 'linked'));
    await symlink(join(outside, 'outside.ts'), join(root, 'src/symlink.ts'));
    await link(join(outside, 'outside.ts'), join(root, 'src/hardlink.ts'));
    const linked = metadata([{ path: 'linked/outside.ts', bytes }]);
    assert.deepEqual(await readBoundLocalCapture(root, linked.capture, linked.files),
      { ok: false, code: 'UNSAFE_PATH', path: 'linked/outside.ts' });
    const finalLink = metadata([{ path: 'src/symlink.ts', bytes }]);
    assert.deepEqual(await readBoundLocalCapture(root, finalLink.capture, finalLink.files),
      { ok: false, code: 'UNSAFE_PATH', path: 'src/symlink.ts' });
    const hardLink = metadata([{ path: 'src/hardlink.ts', bytes }]);
    assert.deepEqual(await readBoundLocalCapture(root, hardLink.capture, hardLink.files),
      { ok: false, code: 'NOT_REGULAR', path: 'src/hardlink.ts' });
    const changed = metadata([{ path: 'src/allowed.ts', bytes }]);
    await writeFile(join(root, 'src/allowed.ts'), encoded('export class Changed {}'));
    assert.deepEqual(await readBoundLocalCapture(root, changed.capture, changed.files),
      { ok: false, code: 'SOURCE_CHANGED' });
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

test('unsafe scope, missing file and directory-as-file never return bytes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cf-local-read-'));
  try {
    await mkdir(join(root, 'src'));
    await mkdir(join(root, 'src/directory.ts'));
    const bytes = encoded('export class A {}');
    const traversal = metadata([{ path: 'src/valid.ts', bytes }]);
    traversal.files[0]!.path = '../outside.ts';
    assert.deepEqual(await readBoundLocalCapture(root, traversal.capture, traversal.files),
      { ok: false, code: 'INVALID_SCOPE' });
    const hidden = metadata([{ path: '.local/hidden.ts', bytes }]);
    assert.deepEqual(await readBoundLocalCapture(root, hidden.capture, hidden.files),
      { ok: false, code: 'INVALID_SCOPE' });
    const secret = metadata([{ path: 'secrets/key.ts', bytes }]);
    assert.deepEqual(await readBoundLocalCapture(root, secret.capture, secret.files),
      { ok: false, code: 'INVALID_SCOPE' });
    const secretFile = metadata([{ path: 'src/secrets.ts', bytes }]);
    assert.deepEqual(await readBoundLocalCapture(root, secretFile.capture, secretFile.files),
      { ok: false, code: 'INVALID_SCOPE' });
    const missing = metadata([{ path: 'src/missing.ts', bytes }]);
    assert.deepEqual(await readBoundLocalCapture(root, missing.capture, missing.files),
      { ok: false, code: 'MISSING_FILE', path: 'src/missing.ts' });
    const directory = metadata([{ path: 'src/directory.ts', bytes: new Uint8Array() }]);
    assert.deepEqual(await readBoundLocalCapture(root, directory.capture, directory.files),
      { ok: false, code: 'NOT_REGULAR', path: 'src/directory.ts' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
