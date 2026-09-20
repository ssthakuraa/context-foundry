export type TaskIntent = 'inquiry' | 'consume_api' | 'diagnose' | 'impact_analysis' | 'implement_change';
export type TaskPhase = 'mapping' | 'scope_review' | 'investigating' | 'proposal_review' |
  'implementing' | 'validation_review' | 'completed' | 'cancelled';
export type TaskPhaseEvent = 'submit_map' | 'scope_accept' | 'scope_revise' |
  'submit_findings' | 'submit_proposal' | 'proposal_approve' | 'proposal_design_only' |
  'proposal_revise' | 'material_scope_change' | 'implementation_reassess' |
  'submit_completion' | 'completion_accept' | 'cancel';
export type TransitionAuthority = 'task_write' | 'verified_human_scope' |
  'verified_human_implementation' | 'verified_human_completion' | 'authorized_owner';
export type PhaseTransition = { to: TaskPhase; required_authority: TransitionAuthority };

/** A pure transition *plan*. The server must authenticate/authorize and commit atomically. */
export function planTaskTransition(
  phase: TaskPhase,
  intent: TaskIntent,
  event: TaskPhaseEvent,
): PhaseTransition | undefined {
  if (phase === 'completed' || phase === 'cancelled') return undefined;
  if (event === 'cancel') return { to: 'cancelled', required_authority: 'authorized_owner' };
  if (event === 'submit_map' && (phase === 'mapping' || phase === 'investigating')) {
    return { to: 'scope_review', required_authority: 'task_write' };
  }
  if (event === 'material_scope_change' && phase === 'investigating') {
    return { to: 'scope_review', required_authority: 'task_write' };
  }
  if (phase === 'scope_review') {
    if (event === 'scope_accept') return { to: 'investigating', required_authority: 'verified_human_scope' };
    if (event === 'scope_revise') return { to: 'mapping', required_authority: 'verified_human_scope' };
  }
  if (phase === 'investigating') {
    if (event === 'submit_findings' && intent !== 'implement_change') {
      return { to: 'validation_review', required_authority: 'task_write' };
    }
    if (event === 'submit_proposal' && intent === 'implement_change') {
      return { to: 'proposal_review', required_authority: 'task_write' };
    }
  }
  if (phase === 'proposal_review' && intent === 'implement_change') {
    if (event === 'proposal_approve') {
      return { to: 'implementing', required_authority: 'verified_human_implementation' };
    }
    if (event === 'proposal_design_only') {
      return { to: 'proposal_review', required_authority: 'verified_human_implementation' };
    }
    if (event === 'proposal_revise') {
      return { to: 'investigating', required_authority: 'verified_human_implementation' };
    }
  }
  if (phase === 'implementing' && intent === 'implement_change') {
    if (event === 'material_scope_change') return { to: 'scope_review', required_authority: 'task_write' };
    if (event === 'implementation_reassess') return { to: 'investigating', required_authority: 'task_write' };
    if (event === 'submit_completion') return { to: 'validation_review', required_authority: 'task_write' };
  }
  if (phase === 'validation_review' && event === 'completion_accept') {
    return { to: 'completed', required_authority: 'verified_human_completion' };
  }
  return undefined;
}
