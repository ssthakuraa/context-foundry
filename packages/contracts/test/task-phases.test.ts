import assert from 'node:assert/strict';
import test from 'node:test';
import { planTaskTransition, type TaskPhase } from '../src/index.js';

test('implementation path has two separately labelled human gates', () => {
  assert.deepEqual(planTaskTransition('mapping', 'implement_change', 'submit_map'),
    { to: 'scope_review', required_authority: 'task_write' });
  assert.deepEqual(planTaskTransition('scope_review', 'implement_change', 'scope_accept'),
    { to: 'investigating', required_authority: 'verified_human_scope' });
  assert.deepEqual(planTaskTransition('investigating', 'implement_change', 'submit_proposal'),
    { to: 'proposal_review', required_authority: 'task_write' });
  assert.deepEqual(planTaskTransition('proposal_review', 'implement_change', 'proposal_approve'),
    { to: 'implementing', required_authority: 'verified_human_implementation' });
  assert.deepEqual(planTaskTransition('implementing', 'implement_change', 'submit_completion'),
    { to: 'validation_review', required_authority: 'task_write' });
  assert.deepEqual(planTaskTransition('validation_review', 'implement_change', 'completion_accept'),
    { to: 'completed', required_authority: 'verified_human_completion' });
});

test('diagnosis cannot enter implementation and silence is not approval', () => {
  assert.equal(planTaskTransition('investigating', 'diagnose', 'submit_proposal'), undefined);
  assert.equal(planTaskTransition('proposal_review', 'diagnose', 'proposal_approve'), undefined);
  assert.equal(planTaskTransition('scope_review', 'diagnose', 'submit_findings'), undefined);
  assert.deepEqual(planTaskTransition('investigating', 'diagnose', 'submit_findings'),
    { to: 'validation_review', required_authority: 'task_write' });
  assert.equal(planTaskTransition('validation_review', 'diagnose', 'submit_completion'), undefined);
});

test('revisions, source reassessment and cancellation never imply prior authority', () => {
  assert.deepEqual(planTaskTransition('proposal_review', 'implement_change', 'proposal_design_only'),
    { to: 'proposal_review', required_authority: 'verified_human_implementation' });
  assert.deepEqual(planTaskTransition('proposal_review', 'implement_change', 'proposal_revise'),
    { to: 'investigating', required_authority: 'verified_human_implementation' });
  assert.deepEqual(planTaskTransition('implementing', 'implement_change', 'material_scope_change'),
    { to: 'scope_review', required_authority: 'task_write' });
  assert.deepEqual(planTaskTransition('implementing', 'implement_change', 'implementation_reassess'),
    { to: 'investigating', required_authority: 'task_write' });
  assert.deepEqual(planTaskTransition('investigating', 'implement_change', 'material_scope_change'),
    { to: 'scope_review', required_authority: 'task_write' });
  for (const phase of ['mapping', 'scope_review', 'investigating', 'proposal_review',
    'implementing', 'validation_review'] as TaskPhase[]) {
    assert.deepEqual(planTaskTransition(phase, 'implement_change', 'cancel'),
      { to: 'cancelled', required_authority: 'authorized_owner' });
  }
  assert.equal(planTaskTransition('completed', 'implement_change', 'cancel'), undefined);
  assert.equal(planTaskTransition('cancelled', 'implement_change', 'submit_map'), undefined);
});
