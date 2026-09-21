import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { parseJsonStrict, validate, type RecordEnvelope } from '../src/index.js';
import {
  checkExtensionHandshake, checkExtensionRecords, inspectExtensionRecord,
  createBuiltinProfile, installKindProfiles, kindProfileDigest, migrateLegacySymbol,
  searchExtensionDescriptors, utf16OffsetToUtf8ByteOffset,
  type AdapterManifest, type ExtensionConsumer, type ExtensionRecord, type KindProfile,
} from '../src/extensions.js';
import type { EvidenceLocator } from '../src/index.js';

type Vector = {
  profile: KindProfile; manifest: AdapterManifest; consumer: ExtensionConsumer;
  record: ExtensionRecord; locator: EvidenceLocator;
};

const vector = parseJsonStrict(execFileSync('python3', [
  new URL('../../fixtures/emit-extension-vector.py', import.meta.url).pathname,
], { encoding: 'utf8' })) as Vector;

function fixture() {
  const installed = installKindProfiles([vector.profile]);
  assert.deepEqual(installed.issues, []);
  assert.ok(installed.installed);
  return { installed: installed.installed, ...vector };
}

test('independent Python producer installs and reaches generic search and inspect', () => {
  const { installed, profile, manifest, consumer, record, locator } = fixture();
  assert.equal(profile.profile_digest, kindProfileDigest(profile));
  assert.deepEqual(checkExtensionHandshake(manifest, consumer, installed), []);
  const checked = checkExtensionRecords([record], [locator], manifest, consumer, installed);
  assert.deepEqual(checked.issues, []);
  assert.deepEqual(checked.evidenceByRecord?.get(record.record_id), ['ev:workflow']);
  assert.equal(searchExtensionDescriptors([record], [locator], manifest, consumer, installed, 'réparer')
    .hits[0]?.record_id, 'rec:workflow');
  assert.equal(inspectExtensionRecord([record], [locator], manifest, consumer, installed, 'rec:workflow')
    .record?.payload['name'], 'Réparer 🔧');
});

test('installed schema, full profile digest and protocol major must match', () => {
  const { installed, profile, manifest, consumer } = fixture();
  const mutated = { ...profile, semantic_major: 2 };
  assert.deepEqual(installKindProfiles([mutated]).issues.map(x => x.code), ['PROFILE_DIGEST_MISMATCH']);
  assert.deepEqual(installKindProfiles([{ ...profile, payload_schema: {
    ...profile.payload_schema, $ref: 'https://example.invalid/schema',
  } }]).issues.map(x => x.code), ['UNSAFE_PAYLOAD_SCHEMA']);
  const spoof = { ...profile, kind: 'engineering.calls' };
  assert.deepEqual(installKindProfiles([{ ...spoof, profile_digest: kindProfileDigest(spoof) }])
    .issues.map(x => x.code), ['INVALID_PROFILE']);
  assert.deepEqual(checkExtensionHandshake({ ...manifest, protocol_major: 2 } as unknown as AdapterManifest,
    consumer, installed).map(x => x.code), ['INVALID_MANIFEST']);
  assert.ok(checkExtensionHandshake({ ...manifest, emitted_profiles: [{
    kind: profile.kind, profile_digest: '0'.repeat(64),
  }] }, consumer, installed).some(x => x.code === 'PROFILE_VERSION_MISMATCH'));
  assert.ok(checkExtensionHandshake(manifest, { ...consumer, required_profiles: [{
    kind: 'missing.kind', profile_digest: '0'.repeat(64),
  }] }, installed).some(x => x.code === 'MISSING_REQUIRED_PROFILE'));
});

test('unknown and malformed records never appear in generic search', () => {
  const { installed, manifest, consumer, record, locator } = fixture();
  const cases: [ExtensionRecord, string][] = [
    [{ ...record, kind: 'other.workflow' }, 'UNKNOWN_PROFILE'],
    [{ ...record, profile_digest: '0'.repeat(64) }, 'PROFILE_VERSION_MISMATCH'],
    [{ ...record, payload: { name: 'x', artifact_type: 'workflow', surprise: 'x' } }, 'INVALID_PAYLOAD'],
    [{ ...record, evidence_refs: ['ev:missing'],
      descriptor: { ...record.descriptor, locator_refs: ['ev:missing'] } }, 'MISSING_EVIDENCE'],
    [{ ...record, descriptor: { ...record.descriptor, locator_refs: ['ev:missing'] } }, 'INVALID_DESCRIPTOR_SUPPORT'],
    [{ ...record, identity: { ...record.identity, scheme: 'other' } }, 'IDENTITY_SCHEME_MISMATCH'],
    [{ ...record, references: [{ role: 'calls', target_kind: 'engineering.symbol',
      target: record.identity, resolution: 'resolved' }] }, 'INVALID_REFERENCE_ROLE'],
  ];
  for (const [invalid, expected] of cases) {
    const result = searchExtensionDescriptors([invalid], [locator], manifest, consumer, installed, 'workflow');
    assert.ok(result.issues.some(x => x.code === expected), `${expected}: ${JSON.stringify(result.issues)}`);
    assert.deepEqual(result.hits, []);
  }
  assert.deepEqual(checkExtensionRecords([record, { ...record, record_id: 'rec:second' }],
    [locator], manifest, consumer, installed).issues.map(x => x.code),
  ['DUPLICATE_DECLARATION_IDENTITY']);
  assert.deepEqual(checkExtensionRecords([record, record], [locator], manifest, consumer, installed)
    .issues.map(x => x.code), ['DUPLICATE_RECORD_ID', 'DUPLICATE_DECLARATION_IDENTITY']);
});

test('engineering reference cycles and proof dependency cycles are distinct', () => {
  const { profile, manifest, consumer, record, locator } = fixture();
  const base = { ...profile, reference_roles: [{ role: 'peer', target_kind: profile.kind }] };
  const cycledProfile = { ...base, profile_digest: kindProfileDigest(base) };
  const installed = installKindProfiles([cycledProfile]).installed!;
  const ref = { kind: profile.kind, profile_digest: cycledProfile.profile_digest };
  const adaptedManifest = { ...manifest, emitted_profiles: [ref] };
  const adaptedConsumer = { ...consumer, required_profiles: [ref], accepted_profiles: [ref] };
  const second = { ...record, record_id: 'rec:second',
    identity: { ...record.identity, key: 'second' },
    profile_digest: cycledProfile.profile_digest,
    evidence_refs: ['ev:second'], descriptor: { ...record.descriptor, locator_refs: ['ev:second'] },
    references: [{ role: 'peer', target_kind: profile.kind, target: record.identity,
      resolution: 'resolved' as const }],
  };
  const first = { ...record, profile_digest: cycledProfile.profile_digest,
    references: [{ role: 'peer', target_kind: profile.kind, target: second.identity,
      resolution: 'resolved' as const }],
  };
  const secondLocator = { ...locator, evidence_id: 'ev:second' };
  assert.deepEqual(checkExtensionRecords([first, second], [locator, secondLocator],
    adaptedManifest, adaptedConsumer, installed).issues, []);
  assert.deepEqual(checkExtensionRecords([
    { ...first, dependency_refs: ['rec:second'] },
    { ...second, dependency_refs: ['rec:workflow'] },
  ], [locator, secondLocator], adaptedManifest, adaptedConsumer, installed)
    .issues.map(x => x.code), ['DEPENDENCY_CYCLE_OR_BLOCKED', 'DEPENDENCY_CYCLE_OR_BLOCKED']);
  assert.deepEqual(checkExtensionRecords([{ ...first, references: [{
    role: 'peer', target_kind: profile.kind,
    target: { ...second.identity, key: 'missing' }, resolution: 'resolved',
  }] }], [locator], adaptedManifest, adaptedConsumer, installed)
    .issues.map(x => x.code), ['MISSING_REFERENCE_TARGET']);
});

test('legacy symbols migrate only through explicit identity and remain 0.2.0 otherwise', () => {
  const profile = createBuiltinProfile('engineering.symbol');
  assert.deepEqual(installKindProfiles([profile]).issues, []);
  const legacy: RecordEnvelope = {
    schema_version: '0.2.0', record_id: 'rec:java', entity_id: 'repo:Service',
    kind: 'engineering.symbol', owner_id: 'team:demo', origin: 'source_declared',
    review: { state: 'not_required' }, payload: {
      name: 'Service', artifact_kind: 'type', language: 'java',
    }, evidence_refs: ['ev:java'], dependency_refs: [], classification: 'public',
  };
  assert.equal(validate('record_envelope', legacy), true);
  const migrated = migrateLegacySymbol(legacy, {
    source_namespace: 'repo:demo', scheme: 'syntax', scheme_version: '1', key: 'Service',
  }, profile, 'producer:demo');
  assert.equal(migrated.schema_version, '0.3.0');
  assert.equal(migrated.descriptor.name, 'Service');
  assert.equal(legacy.schema_version, '0.2.0');
  assert.throws(() => migrateLegacySymbol({ ...legacy, kind: 'business.rule' },
    migrated.identity, profile, 'producer:demo'));
  assert.equal(validate('engineering_symbol_payload', {
    name: 'K', artifact_kind: 'type', language: 'kotlin',
  }), false);
});

test('source artifacts and new language symbols use reviewed generic profiles', () => {
  const { manifest, consumer, record, locator } = fixture();
  const artifact = createBuiltinProfile('source.artifact');
  const symbol = createBuiltinProfile('engineering.symbol');
  const installed = installKindProfiles([artifact, symbol]);
  assert.deepEqual(installed.issues, []);
  const ref = { kind: artifact.kind, profile_digest: artifact.profile_digest };
  const adaptedManifest = { ...manifest, emitted_profiles: [ref] };
  const adaptedConsumer = { ...consumer, required_profiles: [ref], accepted_profiles: [ref] };
  const dataRecord = { ...record, kind: artifact.kind, profile_digest: artifact.profile_digest,
    identity: { ...record.identity, scheme: 'source-artifact' },
    payload: { artifact_type: 'table', name: 'repair_request' },
    descriptor: { name: 'repair_request', aliases: [], locator_refs: ['ev:workflow'] },
  };
  assert.deepEqual(searchExtensionDescriptors([dataRecord], [locator], adaptedManifest,
    adaptedConsumer, installed.installed!, 'repair_request').hits.map(x => x.kind), ['source.artifact']);
  const symbolRef = { kind: symbol.kind, profile_digest: symbol.profile_digest };
  const kotlinRecord = { ...record, kind: symbol.kind, profile_digest: symbol.profile_digest,
    identity: { ...record.identity, scheme: 'syntax' },
    payload: { name: 'approve', artifact_kind: 'method', language: 'kotlin', signature: 'approve(String)' },
    descriptor: { name: 'approve', aliases: [], locator_refs: ['ev:workflow'] },
  };
  assert.deepEqual(checkExtensionRecords([kotlinRecord], [locator],
    { ...manifest, emitted_profiles: [symbolRef] },
    { ...consumer, required_profiles: [symbolRef], accepted_profiles: [symbolRef] },
    installed.installed!).issues, []);
});

test('UTF-16 parser offsets convert to UTF-8 bytes without splitting Unicode characters', () => {
  const source = 'A🔧B';
  assert.equal(utf16OffsetToUtf8ByteOffset(source, 1), 1);
  assert.equal(utf16OffsetToUtf8ByteOffset(source, 3), 5);
  assert.throws(() => utf16OffsetToUtf8ByteOffset(source, 2));
  assert.throws(() => utf16OffsetToUtf8ByteOffset(source, 5));
  assert.throws(() => utf16OffsetToUtf8ByteOffset('bad\ud800', 0));
});
