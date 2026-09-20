# Restart prompt for ContextFoundry

Copy the following paragraph into a new Codex task if this task cannot be resumed directly. Use the same local ContextFoundry repository.

> Continue the ContextFoundry validation slice in `/home/ssthakur/projects/context-foundry`. First read `/home/ssthakur/projects/context-foundry/restartcontext.md` and `/home/ssthakur/projects/context-foundry/WORKLIST.md`, then inspect current Git status and the relevant CF-0.2 design and contract docs. Those files are continuity aids; verify their claims against the workspace and follow my latest messages. Proceed with the earliest pending work package, currently WP0/WP1 unless the worklist shows newer progress. Keep documentation synchronized with implementation, update checked progress in WORKLIST.md, refresh restartcontext.md, and regenerate/check HTML for edited docs. The rentalapp, platform and agentic-platform repositories are read-only evaluation inputs. Give me concrete progress and only ask for product judgments or external decisions that cannot be resolved from sources. Do not assume an experiment passed or that human review was granted because a design document proposes it.

If you can resume this same task, ask Codex simply: “Continue ContextFoundry from `restartcontext.md` and `WORKLIST.md`.” A resumed task retains conversation history; a new task needs the fuller paragraph above.
