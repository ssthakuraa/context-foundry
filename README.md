# ContextFoundry

Trusted engineering context for AI agents.

ContextFoundry is being designed as an open-source, self-hosted platform for building and
serving governed knowledge about enterprise software systems. It connects
business requirements to source code, architecture, ownership, dependencies,
tests, and validation evidence so that AI coding agents can work with context
that is specific to an enterprise.

ContextFoundry complements tools such as Codex, Claude Code, and Cursor. It
does not replace their code-generation or agent capabilities.

## Documentation

Start with the [design-closeout review guide](docs/review-guide.md), or open
`docs/html/index.html` in a browser for the complete HTML review package.

- [Documentation index](docs/index.md)
- [Product requirements](docs/requirements/product-requirements.md)
- [Research verdict and competitive confidence](docs/research/design-closeout.md)
- [Validation implementation work packages](docs/execution/validation-work-packages.md)
- [Vision](docs/vision.md)
- [Engineering context](docs/concepts/engineering-context.md)
- [Knowledge packs](docs/concepts/knowledge-packs.md)
- [Evidence and provenance](docs/concepts/evidence-and-provenance.md)
- [Architecture overview](docs/architecture/overview.md)
- [Target architecture workbench](docs/design/target-architecture-workbench.md)
- [Test impact and validation](docs/design/test-impact-and-validation.md)
- [Identity and policy](docs/design/identity-and-policy.md)

## Project status

The project is in the design phase. CF-0.2 reconciles architecture, functional and
technical designs with the two-gate human workflow and a Java/Spring plus TypeScript
validation slice. Research synthesis and the design handoff are ready for review;
prototype effectiveness, performance and market competitiveness remain unvalidated.
Product runtime implementation has not started; WP0 evaluation setup and WP1
executable contract work are underway.
The [public GitHub repository](https://github.com/ssthakuraa/context-foundry) is live. License selection is pending.

## Contract development

The initial contract package is under `packages/contracts`. With Node.js 22+ and
pnpm 11, run `pnpm install --frozen-lockfile`, then `pnpm test`, `pnpm typecheck`
and `pnpm build`. Run `pnpm --filter @context-foundry/contracts schema:check`
to verify the nine exported Draft 7 JSON schemas match the TypeScript source.
These are a WP1 subset; they are not a complete or frozen product API.

## Build the review pages

Use Python 3.10+ with `markdown-it-py==3.0.0` (the tested documentation dependency):

```bash
python3 scripts/build-docs.py
python3 scripts/build-docs.py --check
```

Each Markdown document generates a matching page in its sibling `html/` directory.
The generator validates local HTML links and heading anchors. Generated files should
be updated with the Markdown sources. HTML pages load no external scripts or fonts.
