import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { fileManifestDigest, parseJsonStrict, type CapturedFile, type SourceCapture } from '@context-foundry/contracts';
import { installKindProfiles, searchExtensionDescriptors,
  type AdapterManifest, type ExtensionConsumer, type KindProfile } from '@context-foundry/contracts/extensions';
import { runProducerJob, type ProducerJob } from '../src/runner.js';

const vector = parseJsonStrict(execFileSync('python3', [
  new URL('../../../contracts/fixtures/emit-extension-vector.py', import.meta.url).pathname,
], { encoding: 'utf8' })) as { profile: KindProfile; manifest: AdapterManifest; consumer: ExtensionConsumer };
const installed = installKindProfiles([vector.profile]).installed!;
const script = new URL('../../fixtures/python-workflow-adapter.py', import.meta.url).pathname;
const source = new TextEncoder().encode('<workflow name="Repair 🔧"/>');

function job(bytes = source): ProducerJob {
  const file: CapturedFile = {
    schema_version: '0.2.0', source_id: 'repo:fixture', snapshot_id: 'snap:1',
    path: 'workflows/repair.xml', file_digest: createHash('sha256').update(source).digest('hex'),
    bytes: source.byteLength, media_kind: 'application/xml', language_kind: 'acme-workflow',
    classification: 'public',
  };
  const capture: SourceCapture = {
    schema_version: '0.2.0', capture_id: 'capture:fixture', source_id: file.source_id,
    authority_id: 'team:fixture', snapshot_id: file.snapshot_id,
    revision_kind: 'supplied_snapshot', captured_at: '2026-09-20T00:00:00Z',
    file_manifest_digest: fileManifestDigest([file]),
    publication_policy_ref: 'policy:public-fixture', capture_producer_id: 'test:fixture',
    capture_policy: 'approved_content', classification: 'public',
  };
  return {
    job_id: 'job:1', capture: { capture, files: [file],
      supplied: [{ path: file.path, bytes }] },
    manifest: vector.manifest, consumer: vector.consumer, installed,
    executable: 'python3', argv: [script],
  };
}

test('reviewed Python adapter returns one atomic source-bound candidate', async () => {
  const result = await runProducerJob(job());
  assert.equal(result.ok, true, JSON.stringify(result));
  if (!result.ok) return;
  assert.equal(result.candidate.records.length, 1);
  assert.equal(result.candidate.locators[0]?.path, 'workflows/repair.xml');
  assert.equal(result.candidate.coverage[0]?.status, 'partial');
  assert.equal(result.candidate.records[0]?.payload['name'], 'Repair 🔧');
  assert.equal(searchExtensionDescriptors(result.candidate.records, result.candidate.locators,
    vector.manifest, vector.consumer, installed, 'Repair').hits.length, 1);
  const repeated = await runProducerJob({ ...job(), job_id: 'job:2' });
  assert.equal(repeated.ok, true);
  if (repeated.ok) assert.equal(repeated.candidate.digest, result.candidate.digest);
});

test('changed bytes and invalid protocol fail before a producer can contribute', async () => {
  assert.deepEqual(await runProducerJob(job(new TextEncoder().encode('<workflow name="Changed"/>'))),
    { ok: false, code: 'CAPTURE_BYTES_CHANGED' });
  assert.deepEqual(await runProducerJob({ ...job(), manifest: {
    ...vector.manifest, protocol_major: 2,
  } as unknown as AdapterManifest }), { ok: false, code: 'INVALID_INPUT' });
});

test('truncated, invalid UTF-8 and oversized output cannot activate a candidate', async () => {
  const base = job();
  const scenarios: { code: string; expected: string }[] = [
    { code: 'print("partial")', expected: 'INVALID_STREAM' },
    { code: 'import sys;sys.stdout.buffer.write(bytes([255,10]))', expected: 'INVALID_STREAM' },
    { code: 'print("x"*70000)', expected: 'OUTPUT_LIMIT' },
  ];
  for (const scenario of scenarios) {
    const result = await runProducerJob({ ...base, argv: ['-c', scenario.code] });
    assert.deepEqual(result, { ok: false, code: scenario.expected });
  }
});

test('unsupported XML fails the process without a partially accepted record', async () => {
  const bad = new TextEncoder().encode('<!DOCTYPE workflow><workflow name="Repair"/>');
  const input = job(bad);
  const file = { ...input.capture.files[0]!, file_digest: createHash('sha256').update(bad).digest('hex'),
    bytes: bad.byteLength };
  const capture = { ...input.capture.capture, file_manifest_digest: fileManifestDigest([file]) };
  assert.deepEqual(await runProducerJob({ ...input,
    capture: { capture, files: [file], supplied: [{ path: file.path, bytes: bad }] },
  }), { ok: false, code: 'ADAPTER_FAILED' });
});

test('cancelled jobs never return staged producer output', async () => {
  const signal = new AbortController();
  signal.abort();
  assert.deepEqual(await runProducerJob({ ...job(), signal: signal.signal }),
    { ok: false, code: 'CANCELLED' });
  const running = new AbortController();
  const task = runProducerJob({ ...job(), argv: ['-c', 'import time;time.sleep(1)'],
    signal: running.signal });
  running.abort();
  assert.deepEqual(await task, { ok: false, code: 'CANCELLED' });
});
