import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalSha256, checkTaskArtifactReferences, CONTRACT_VERSION, Schemas,
  validate, validateDetailed, type TaskArtifact,
} from '../src/index.js';

const hash = 'a'.repeat(64);

test('all core schemas compile in strict mode', () => {
  assert.equal(Object.keys(Schemas).length, 23);
});

test('interface operations describe source-declared contracts without claiming runtime behavior', () => {
  const payload = {
    interface_id: 'api:approval', operation_key: 'approval:submit', protocol: 'http',
    http_method: 'POST', route_template: '/approvals', request_contract_ref: 'schema:approval-request',
    response_contract_ref: 'schema:approval-response', implementation_entity_ref: 'repo:A:ApprovalService',
  };
  const record = {
    schema_version: CONTRACT_VERSION, record_id: 'rec:operation', entity_id: 'api:approval:submit',
    kind: 'interface.operation', owner_id: 'team:A', origin: 'source_declared',
    review: { state: 'not_required' }, payload, evidence_refs: ['ev:route'],
    dependency_refs: [], classification: 'internal',
  };
  assert.equal(validate('record_envelope', record), true);
  assert.equal(validate('record_envelope', { ...record, origin: 'model_proposed' }), false);
  assert.equal(validate('interface_operation_payload', { ...payload, route_template: undefined }), false);
  assert.equal(validate('interface_operation_payload', { ...payload, protocol: 'event' }), false);
  assert.equal(validate('interface_operation_payload', { ...payload, behavior_verified: true }), false);
  assert.equal(validate('interface_operation_payload', {
    interface_id: 'topic:approval', operation_key: 'approval:changed', protocol: 'event',
  }), true);
});

test('test associations are distinct from execution outcomes or blanket coverage', () => {
  const payload = {
    test_entity_id: 'repo:A:ApprovalTest.submit', target_entity_id: 'repo:A:ApprovalService.submit',
    target_kind: 'engineering_entity', association_basis: 'static_reference',
    expected_scope: 'submit path for a configured threshold',
  };
  const record = {
    schema_version: CONTRACT_VERSION, record_id: 'rec:test-association', entity_id: 'repo:A:ApprovalTest.submit',
    kind: 'test.association', owner_id: 'team:A', origin: 'static_resolution',
    review: { state: 'not_required' }, payload, evidence_refs: ['ev:test'],
    dependency_refs: [], classification: 'internal',
  };
  assert.equal(validate('record_envelope', record), true);
  assert.equal(validate('record_envelope', { ...record, origin: 'model_proposed' }), false);
  assert.equal(validate('test_association_payload', { ...payload, outcome: 'passed' }), false);
  assert.equal(validate('test_association_payload', { ...payload, expected_scope: '' }), false);
  assert.equal(validate('record_envelope', { ...record, payload: {
    ...payload, association_basis: 'reviewed_relevance',
  } }), false);
  assert.equal(validate('record_envelope', {
    ...record, origin: 'human_asserted', payload: { ...payload, association_basis: 'reviewed_relevance' },
  }), true);
});

test('capture accepts a bounded source identity and rejects unknown fields', () => {
  const capture = {
    schema_version: CONTRACT_VERSION, capture_id: 'cap:1', source_id: 'repo:demo',
    authority_id: 'team:demo', snapshot_id: 'snapshot:1', revision_kind: 'git',
    revision_value: '0123456', captured_at: '2026-09-20T00:00:00Z',
    file_manifest_digest: hash, publication_policy_ref: 'policy:1',
    capture_producer_id: 'producer:1', capture_policy: 'metadata_only', classification: 'internal',
  };
  assert.equal(validate('source_capture', capture), true);
  assert.equal(validate('source_capture', { ...capture, secret: 'hidden' }), false);
  assert.match(validateDetailed('source_capture', { ...capture, secret: 'hidden' }).errors.join(' '), /additional properties/);
  assert.equal(validate('source_capture', { ...capture, file_manifest_digest: 'wrong' }), false);
  assert.equal(validate('source_capture', { ...capture, schema_version: '0.1.0' }), false);
  assert.equal(validate('source_capture', { ...capture, revision_kind: 'unversioned' }), false);
});

test('locators discriminate file lines from document sections', () => {
  const base = {
    evidence_id: 'ev:service', source_id: 'repo:demo', snapshot_id: 'snapshot:1', revision_kind: 'git',
    revision_value: '0123456', path: 'src/Service.java', file_digest: hash,
  };
  assert.equal(validate('evidence_locator', { kind: 'file', ...base }), true);
  assert.equal(validate('evidence_locator', { kind: 'file', ...base, evidence_id: undefined }), false);
  assert.equal(validate('evidence_locator', {
    kind: 'file_range', ...base, start_line: 3, end_line: 9,
  }), true);
  assert.equal(validate('evidence_locator', {
    kind: 'document_section', ...base, section_id: 'Policy > Approval',
  }), true);
  assert.equal(validate('evidence_locator', {
    kind: 'file_range', ...base, start_line: 0, end_line: 9,
  }), false);
  assert.equal(validate('evidence_locator', { kind: 'file_range', ...base, start_line: 3 }), false);
  assert.equal(validate('evidence_locator', { kind: 'file_range', ...base, start_line: 9, end_line: 3 }), false);
  assert.match(validateDetailed('evidence_locator', { kind: 'file_range', ...base, start_line: 9, end_line: 3 }).errors.join(' '), /start_line/);
  assert.equal(validate('evidence_locator', { kind: 'file', ...base, path: '../secret' }), false);
  assert.equal(validate('evidence_locator', { kind: 'file', ...base, path: 'C:\\secret' }), false);
  assert.equal(validate('evidence_locator', { kind: 'file', ...base, path: 'src/evil\u0000name' }), false);
  assert.equal(validate('evidence_locator', { kind: 'file', ...base, byte_span: { start: 5, end: 5 } }), false);
});

test('record envelope retains origin and review as separate dimensions', () => {
  const record = {
    schema_version: CONTRACT_VERSION, record_id: 'rec:1', entity_id: 'repo:demo:symbol:A.m',
    kind: 'engineering.symbol', owner_id: 'team:demo', origin: 'source_declared',
    review: { state: 'not_required' },
    payload: { name: 'm', artifact_kind: 'method', language: 'java', signature: 'm(int)' },
    evidence_refs: ['ev:1'],
    dependency_refs: [], classification: 'internal',
  };
  assert.equal(validate('record_envelope', record), true);
  assert.equal(validate('record_envelope', { ...record, review: { state: 'approved', reviewer: 'agent' } }), false);
  assert.equal(validate('record_envelope', { ...record, origin: 'unknown' }), false);
  assert.equal(validate('record_envelope', { ...record, kind: 'engineering.unknown' }), false);
  assert.equal(validate('record_envelope', { ...record, payload: { name: 'm' } }), false);
});

test('symbol and business rule payloads retain explicit kind and applicability', () => {
  const symbol = {
    schema_version: CONTRACT_VERSION, record_id: 'rec:symbol', entity_id: 'repo:A:java:A.m(int)',
    kind: 'engineering.symbol', owner_id: 'team:A', origin: 'source_declared',
    review: { state: 'not_required' }, evidence_refs: ['ev:A'], dependency_refs: [],
    classification: 'internal',
    payload: { name: 'm', artifact_kind: 'method', language: 'java', signature: 'm(int)' },
  };
  assert.equal(validate('record_envelope', symbol), true);
  assert.equal(validate('engineering_symbol_payload', symbol.payload), true);
  assert.equal(validate('record_envelope', { ...symbol, payload: { ...symbol.payload, signature: undefined } }), false);
  assert.equal(validate('engineering_symbol_payload', { ...symbol.payload, signature: undefined }), false);
  assert.equal(validate('record_envelope', { ...symbol, payload: { ...symbol.payload, runtime_behavior: 'proven' } }), false);

  const rule = {
    ...symbol, record_id: 'rec:rule', entity_id: 'business:approval-rule',
    kind: 'business.rule', origin: 'human_asserted', review: { state: 'approved' },
    payload: {
      name: 'Approval threshold', statement: 'Approval is required above the configured threshold.',
      applicability: { status: 'bounded', product_ids: ['product:A'] },
    },
  };
  assert.equal(validate('record_envelope', rule), true);
  assert.equal(validate('business_rule_payload', rule.payload), true);
  assert.equal(validate('record_envelope', { ...rule, payload: {
    ...rule.payload, applicability: { status: 'bounded' },
  } }), false);
  assert.equal(validate('record_envelope', { ...rule, payload: {
    ...rule.payload, applicability: { status: 'unknown', product_ids: ['product:A'] },
  } }), false);
  assert.equal(validate('record_envelope', { ...rule, payload: {
    ...rule.payload, applicability: { status: 'unknown' },
  } }), true);
});

test('business mappings keep basis and origin separate from runtime relationships', () => {
  const payload = {
    business_entity_id: 'business:approval', engineering_entity_id: 'repo:A:ApprovalService',
    mapping_relation: 'implemented_by', mapping_basis: 'reviewed_association',
    applicability: { status: 'bounded', product_ids: ['product:A'] },
  };
  const mapping = {
    schema_version: CONTRACT_VERSION, record_id: 'rec:mapping', entity_id: 'business:approval',
    kind: 'business.mapping', owner_id: 'team:A', origin: 'human_asserted',
    review: { state: 'approved', evidence_fingerprint: hash }, payload,
    evidence_refs: ['ev:1'], dependency_refs: [], classification: 'internal',
  };
  assert.equal(validate('record_envelope', mapping), true);
  assert.equal(validate('record_envelope', { ...mapping, origin: 'static_resolution' }), false);
  assert.equal(validate('record_envelope', { ...mapping, payload: {
    ...payload, mapping_basis: 'explicit_reference',
  } }), false);
  assert.equal(validate('record_envelope', {
    ...mapping, origin: 'source_declared', payload: { ...payload, mapping_basis: 'explicit_reference' },
  }), true);
  assert.equal(validate('business_mapping_payload', { ...payload, applicability: { status: 'bounded' } }), false);
  assert.equal(validate('business_mapping_payload', { ...payload, mapping_relation: 'calls' }), false);
});

test('execution evidence describes a bounded observation, not implied authorization', () => {
  const run = {
    schema_version: CONTRACT_VERSION, evidence_id: 'ev:run:1', run_id: 'run:1',
    producer_id: 'ci:1', runner_kind: 'ci', input_capture_digests: [hash],
    report_digest: hash, environment_id: 'env:test',
    started_at: '2026-09-20T01:00:00Z', completed_at: '2026-09-20T01:03:00Z',
    outcome: 'passed', observed_test_ids: ['test:approval'],
    observed_obligation_ids: ['obligation:approval'], classification: 'internal',
  };
  assert.equal(validate('execution_evidence', run), true);
  assert.equal(validate('execution_evidence', { ...run, input_capture_digests: [] }), false);
  assert.equal(validate('execution_evidence', { ...run, report_digest: 'wrong' }), false);
  assert.equal(validate('execution_evidence', { ...run, authenticated: true }), false);
  const { completed_at: _omitted, ...incomplete } = run;
  assert.equal(validate('execution_evidence', incomplete), false);
  assert.equal(validate('execution_evidence', {
    ...run, outcome: 'skipped', observed_obligation_ids: ['obligation:approval'],
  }), false);
  assert.equal(validate('execution_evidence', {
    ...run, outcome: 'skipped', observed_obligation_ids: [], observed_test_ids: [],
  }), true);
});

test('coverage and release manifest reject unsupported values', () => {
  const coverage = {
    schema_version: CONTRACT_VERSION, source_id: 'repo:demo', capture_digest: hash,
    adapter_id: 'java:0.1', artifact_family: 'spring-routes',
    supported_patterns: ['literal-mapping'], eligible_count: 10, processed_count: 8,
    failed_count: 1, excluded_count: 1, known_unsupported: ['dynamic-registration'],
    diagnostic_refs: ['diag:1'], status: 'partial', reason: 'dynamic registration',
  };
  assert.equal(validate('coverage', coverage), true);
  assert.equal(validate('coverage', { ...coverage, status: 'probably-complete' }), false);
  assert.equal(validate('coverage', { ...coverage, processed_count: 10 }), false);
  const release = {
    schema_version: CONTRACT_VERSION, pack_id: 'pack:demo', release_id: 'r:1',
    source_manifest_digests: [hash], adapter_digest: hash, config_digest: hash,
    ordered_shard_digests: [], coverage_refs: [], validation_refs: [], created_by: 'human:1',
  };
  assert.equal(validate('release_manifest', release), true);
  assert.equal(validate('release_manifest', { ...release, source_manifest_digests: [] }), false);
});

test('task artifact requires an immutable envelope and rejects unknown kinds', () => {
  const body = {
    intent: 'implement_change', questions: [{ question_id: 'q1', text: 'Change approval behavior?' }],
    candidates: [{ entity_id: 'repo:A:ApprovalService', relevance_reason: 'Owns the approval entry point',
      basis: 'evidence', evidence_refs: ['ev:1'] }],
    assumptions: [], unknowns: [], material_scope_boundaries: [],
  };
  const artifact = {
    schema_version: CONTRACT_VERSION, artifact_id: 'artifact:1', task_id: 'task:1',
    kind: 'scope_map', version: 1, body_digest: canonicalSha256(body), created_by: 'agent:1',
    origin: 'agent', created_at: '2026-09-20T00:00:00Z', release_set_id: 'release-set:1',
    evidence_refs: ['ev:1'], visibility_requirements: ['ev:1'], body,
  };
  assert.equal(validate('task_artifact', artifact), true);
  assert.equal(validate('task_artifact', { ...artifact, kind: 'agent_approval' }), false);
  assert.equal(validate('task_artifact', { ...artifact, body_digest: 'not-a-digest' }), false);
  assert.equal(validate('task_artifact', { ...artifact, body_digest: hash }), false);
  assert.equal(validate('task_artifact', { ...artifact, approved: true }), false);
  assert.equal(validate('task_artifact', { ...artifact, previous_version: 1 }), false);
  assert.equal(validate('task_artifact', { ...artifact, version: 2, previous_version: 1 }), true);
  assert.equal(validate('task_artifact', { ...artifact, evidence_refs: [] }), false);
  const ungrounded = { ...body, candidates: [{ ...body.candidates[0], evidence_refs: [] }] };
  assert.equal(validate('scope_map_body', ungrounded), false);
  assert.equal(validate('task_artifact', {
    ...artifact, body: ungrounded, body_digest: canonicalSha256(ungrounded),
  }), false);
});

test('sufficiency body requires a plan for selective source inspection', () => {
  const body = { assessments: [{
    question_id: 'q1', intended_action: 'propose_change', judgment: 'inspect_source',
    evidence_refs: ['ev:1'], rationale: 'Need implementation details',
    planned_local_reads: ['ev:1'], open_questions: [],
  }] };
  assert.equal(validate('sufficiency_body', body), true);
  const base = {
    schema_version: CONTRACT_VERSION, artifact_id: 'artifact:2', task_id: 'task:1',
    kind: 'sufficiency', version: 1, body_digest: canonicalSha256(body), created_by: 'agent:1',
    origin: 'agent', created_at: '2026-09-20T00:00:00Z', release_set_id: 'release-set:1',
    evidence_refs: ['ev:1'], visibility_requirements: ['ev:1'], body,
  };
  assert.equal(validate('task_artifact', base), true);
  assert.equal(validate('task_artifact', { ...base, evidence_refs: [] }), false);
  const noRead = { assessments: [{ ...body.assessments[0], planned_local_reads: [] }] };
  assert.equal(validate('sufficiency_body', noRead), false);
  assert.equal(validate('task_artifact', { ...base, body: noRead, body_digest: canonicalSha256(noRead) }), false);
});

test('findings, proposal and completion bodies stay typed through review gates', () => {
  const artifact = (kind: TaskArtifact['kind'], body: Record<string, unknown>,
    evidenceRefs: string[] = []): TaskArtifact => ({
    schema_version: CONTRACT_VERSION, artifact_id: `artifact:${kind}`, task_id: 'task:1',
    kind, version: 1, body_digest: canonicalSha256(body), created_by: 'agent:1',
    origin: 'agent', created_at: '2026-09-20T00:00:00Z', release_set_id: 'release-set:1',
    evidence_refs: evidenceRefs, visibility_requirements: evidenceRefs, body,
  });
  const findings = {
    claims: [{ statement: 'ApprovalService checks the threshold', claim_type: 'source_observed',
      evidence_refs: ['ev:1'], read_receipt_refs: ['read:1'] }],
    contradictions: [], impacts: ['Approval flow'], unresolved_obligations: ['Check override behavior'],
    source_fingerprints: [hash],
  };
  const findingsArtifact = artifact('findings', findings, ['ev:1']);
  assert.equal(validate('task_artifact', findingsArtifact), true);
  const noReceipt = { ...findings, claims: [{ ...findings.claims[0], read_receipt_refs: [] }] };
  assert.equal(validate('findings_body', noReceipt), false);
  assert.equal(validate('task_artifact', artifact('findings', noReceipt, ['ev:1'])), false);
  assert.equal(validate('task_artifact', artifact('findings', findings, [])), false);

  const proposal = {
    findings_ref: { artifact_id: findingsArtifact.artifact_id, version: 1,
      body_digest: findingsArtifact.body_digest },
    design_summary: 'Add a bounded threshold override',
    affected_entity_ids: ['repo:A:ApprovalService'], ordered_steps: ['Update service', 'Add tests'],
    permitted_actions_requested: ['modify_source'], exclusions: [],
    validation_obligations: ['Verify old and new approval paths'], risks: ['Wrong override precedence'],
    rollback_approach: 'Revert the service change', source_fingerprints: [hash],
  };
  const proposalArtifact = artifact('implementation_proposal', proposal);
  assert.equal(validate('task_artifact', proposalArtifact), true);
  assert.equal(validate('task_artifact', artifact('implementation_proposal', {
    ...proposal, ordered_steps: [],
  })), false);

  const completion = {
    findings_ref: proposal.findings_ref,
    approved_proposal_ref: { artifact_id: proposalArtifact.artifact_id, version: 1,
      body_digest: proposalArtifact.body_digest },
    actual_changes: ['Updated service'], check_refs: ['run:1'], skipped_checks: [],
    deviations: [], residual_risks: [], requested_final_review: true,
  };
  const completionArtifact = artifact('completion', completion);
  assert.equal(validate('task_artifact', completionArtifact), true);
  assert.equal(validate('task_artifact', artifact('completion', { ...completion, checked: true })), false);
  const { approved_proposal_ref: _omitted, ...withoutProposal } = completion;
  assert.equal(validate('task_artifact', artifact('completion', withoutProposal)), false);
  assert.deepEqual(checkTaskArtifactReferences([findingsArtifact, proposalArtifact, completionArtifact]), []);
  const wrongDigest = artifact('implementation_proposal', {
    ...proposal, findings_ref: { ...proposal.findings_ref, body_digest: hash },
  });
  assert.deepEqual(checkTaskArtifactReferences([findingsArtifact, wrongDigest])
    .map(issue => issue.code), ['REFERENCE_DIGEST_MISMATCH']);
  assert.deepEqual(checkTaskArtifactReferences([proposalArtifact])
    .map(issue => issue.code), ['MISSING_ARTIFACT_REFERENCE']);
  const wrongKind = artifact('completion', {
    ...completion, findings_ref: { artifact_id: proposalArtifact.artifact_id, version: 1,
      body_digest: proposalArtifact.body_digest },
  });
  assert.deepEqual(checkTaskArtifactReferences([findingsArtifact, proposalArtifact, wrongKind])
    .map(issue => issue.code), ['WRONG_REFERENCE_KIND']);
  assert.deepEqual(checkTaskArtifactReferences([findingsArtifact, {
    ...proposalArtifact, task_id: 'task:other',
  }]).map(issue => issue.code), ['MISSING_ARTIFACT_REFERENCE']);
  assert.deepEqual(checkTaskArtifactReferences([findingsArtifact, findingsArtifact])
    .map(issue => issue.code), ['DUPLICATE_KIND_VERSION', 'DUPLICATE_ARTIFACT_VERSION']);
  assert.deepEqual(checkTaskArtifactReferences([{ ...findingsArtifact, version: 2, previous_version: 1 }])
    .map(issue => issue.code), ['MISSING_PREVIOUS_VERSION']);
});

test('human decision receipt is server-shaped but not proof of authority', () => {
  const receipt = {
    schema_version: CONTRACT_VERSION, decision_id: 'decision:1', task_id: 'task:1',
    gate: 'scope', artifact_id: 'artifact:1', artifact_version: 1, artifact_digest: hash,
    outcome: 'accept', reviewer_subject: 'human:1', authority_kind: 'verified_human_session',
    permitted_actions: [], permitted_scope: [], expected_task_version: 1,
    issued_at: '2026-09-20T00:00:00Z',
  };
  assert.equal(validate('human_decision_receipt', receipt), true);
  assert.equal(validate('human_decision_receipt', { ...receipt, authority_kind: 'agent_token' }), false);
  assert.equal(validate('human_decision_receipt', { ...receipt, task_id: undefined }), false);
});

test('task errors use bounded codes without leaking arbitrary details', () => {
  const error = {
    schema_version: CONTRACT_VERSION, code: 'NOT_FOUND_OR_NOT_VISIBLE',
    message: 'Not found or not visible', correlation_id: 'trace:1',
  };
  assert.equal(validate('task_error', error), true);
  assert.equal(validate('task_error', { ...error, code: 'HIDDEN_SOURCE_EXISTS' }), false);
  assert.equal(validate('task_error', { ...error, hidden_source: 'repo:secret' }), false);
});

test('evaluation manifest records comparable arm and unknown cache state', () => {
  const manifest = {
    schema_version: CONTRACT_VERSION, run_id: 'run:1', task_id: 'task:1', arm: 'A', attempt: 1,
    corpus_manifest_digest: hash, task_input_digest: hash, instruction_digest: hash,
    model_id: 'model:1', model_effort: 'medium', host_id: 'host:1',
    policy_generation: 'policy:1', cache_state: 'unknown', status: 'planned',
    started_at: '2026-09-20T00:00:00Z',
  };
  assert.equal(validate('evaluation_run_manifest', manifest), true);
  assert.equal(validate('evaluation_run_manifest', { ...manifest, arm: 'uncontrolled' }), false);
  assert.equal(validate('evaluation_run_manifest', { ...manifest, attempt: 0 }), false);
});

test('captured files keep source identity separate from path', () => {
  const file = {
    schema_version: CONTRACT_VERSION, source_id: 'repo:A', snapshot_id: 'snap:1',
    path: 'src/Service.java', file_digest: hash, bytes: 123, media_kind: 'text/plain',
    language_kind: 'java', classification: 'internal',
  };
  assert.equal(validate('captured_file', file), true);
  assert.equal(validate('captured_file', { ...file, source_id: 'repo:B' }), true);
  assert.equal(validate('captured_file', { ...file, path: '/etc/passwd' }), false);
  assert.equal(validate('captured_file', { ...file, path: 'src/../secret' }), false);
});

test('release sets pin one version per pack', () => {
  const entry = { pack_id: 'pack:A', release_id: 'release:1', manifest_digest: hash };
  const releaseSet = {
    schema_version: CONTRACT_VERSION, release_set_id: 'set:1', packs: [entry],
    cross_pack_bridge_digest: hash,
  };
  assert.equal(validate('release_set', releaseSet), true);
  assert.equal(validate('release_set', { ...releaseSet, packs: [entry, { ...entry, release_id: 'release:2' }] }), false);
  assert.equal(validate('release_set', { ...releaseSet, packs: [] }), false);
});

test('declared relationship records require a supported payload shape', () => {
  const payload = {
    subject_id: 'repo:A:java:Foo.m(int)', object_id: 'repo:B:java:Bar.n()',
    relation_type: 'engineering.calls', direction: 'subject_to_object',
    resolution_method: 'syntax', evidence_refs: ['ev:1'], supporting_record_refs: [],
  };
  assert.equal(validate('relationship_payload', payload), true);
  const record = {
    schema_version: CONTRACT_VERSION, record_id: 'rec:rel:1', entity_id: payload.subject_id,
    kind: 'engineering.relationship', owner_id: 'team:demo', origin: 'static_resolution',
    review: { state: 'not_required' }, payload, evidence_refs: ['ev:1'],
    dependency_refs: [], classification: 'internal',
  };
  assert.equal(validate('record_envelope', record), true);
  assert.equal(validate('record_envelope', { ...record, payload: { ...payload, evidence_refs: [] } }), false);
  assert.equal(validate('record_envelope', { ...record, payload: { ...payload, resolution_method: 'name_match' } }), false);
  assert.equal(validate('record_envelope', { ...record, evidence_refs: ['ev:other'] }), false);
});
