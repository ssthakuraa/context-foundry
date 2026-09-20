#!/usr/bin/env python3
"""Freeze private path/digest metadata for the bounded three-repo evaluation corpus.

This script never copies source bodies. Its output is ignored by Git. It reads only
tracked, allowlisted files and refuses to call a dirty checkout a frozen snapshot.
"""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess


PROJECT = Path(__file__).resolve().parents[1]
OUTPUT = PROJECT / ".local" / "evaluation" / "capture-manifest.json"
SOURCES = {
    "rentalapp": {
        "revision": "9b57b0e871555e815417c6654d193e0554bd6964",
        "exact": {
            "docs/maintenance/MAINTENANCE_FUNCTIONAL_SPEC.md",
            "docs/maintenance/MAINTENANCE_TECHNICAL_SPEC.md",
            "docs/ADR/PF-S1-H2-maintenance-triage.md",
            "database/schema.sql",
            "database/generated/maintenance-foundation.sql",
            "backend/pom.xml",
            "backend/rentalapp-service/pom.xml",
            "frontend/package.json",
            "frontend/src/services/maintenance.ts",
            "frontend/src/services/maintenanceTriage.ts",
            "frontend/src/hooks/api/useMaintenance.ts",
        },
        "prefix": (
            "backend/rentalapp-service/src/main/java/com/rentalapp/service/maintenance/",
            "backend/rentalapp-service/src/test/java/com/rentalapp/service/maintenance/",
            "backend/rentalapp-service/src/test/java/com/rentalapp/contract/maintenance-resource/",
            "frontend/src/pages/operator/maintenance/",
        ),
    },
    "platform": {
        "revision": "3781720a74937e5a4ab67b98b441ca31f4ec0c64",
        "exact": {"packages/java-common/pom.xml", "packages/rbac/package.json"},
        "prefix": (
            "packages/java-common/src/main/java/com/platform/common/persistence/",
            "packages/java-common/src/main/java/com/platform/common/security/",
            "packages/rbac/src/",
        ),
    },
    "agentic-platform": {
        "revision": "0159c29896ece2405a67d5a0db211f3622ccdfd8",
        "exact": {
            "packages/chat-sdk/package.json",
            "packages/chat-sdk/src/types/audit.ts",
            "packages/chat-sdk/src/runtime/audit-emit.ts",
            "apps/api/src/routes/chat-audit.ts",
            "apps/api/src/routes/agent-run-events.ts",
            "apps/api/src/routes/operator-audit.ts",
            "apps/api/config/trusted-issuers.yaml",
        },
        "prefix": ("apps/api/test-contract/",),
        "prefix_names": {"maintenance"},
    },
}


def git(root: Path, *args: str) -> bytes:
    return subprocess.run(
        ["git", "-C", str(root), *args],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).stdout


def included(path: str, spec: dict) -> bool:
    if path in spec["exact"]:
        return True
    if "prefix_names" in spec:
        return path.startswith(spec["prefix"]) and any(name in path.lower() for name in spec["prefix_names"])
    return path.startswith(spec["prefix"])


def build(fixtures_root: Path) -> dict:
    sources = []
    for name, spec in SOURCES.items():
        root = (fixtures_root / name).resolve(strict=True)
        revision = git(root, "rev-parse", "HEAD").decode().strip()
        if revision != spec["revision"]:
            raise ValueError(f"{name}: revision changed; update the benchmark decision first")
        if git(root, "status", "--porcelain", "--untracked-files=no").strip():
            raise ValueError(f"{name}: tracked checkout is dirty; cannot freeze a clean snapshot")
        tracked = (item.decode("utf-8") for item in git(root, "ls-files", "-z").split(b"\0") if item)
        records = []
        for rel in sorted(path for path in tracked if included(path, spec)):
            candidate = root / rel
            resolved = candidate.resolve(strict=True)
            if candidate.is_symlink() or root not in resolved.parents:
                raise ValueError(f"{name}: unsafe path {rel}")
            if not candidate.is_file():
                raise ValueError(f"{name}: missing tracked file {rel}")
            size = candidate.stat().st_size
            if size > 16 * 1024 * 1024:
                raise ValueError(f"{name}: file exceeds 16 MiB capture limit: {rel}")
            digest = hashlib.sha256(candidate.read_bytes()).hexdigest()
            records.append({"path": rel, "sha256": digest, "bytes": size})
        if not records:
            raise ValueError(f"{name}: no selected files")
        missing = spec["exact"] - {record["path"] for record in records}
        if missing:
            raise ValueError(f"{name}: missing expected files: {', '.join(sorted(missing))}")
        sources.append({"source_id": name, "revision_kind": "git", "revision": revision, "files": records})
    return {"schema_version": "0.2.0", "purpose": "private-evaluation-candidate", "sources": sources}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify the existing private manifest")
    parser.add_argument(
        "--fixtures-root", type=Path, default=PROJECT.parent,
        help="parent directory of the three read-only fixture repositories (default: project parent)",
    )
    args = parser.parse_args()
    manifest = build(args.fixtures_root)
    payload = json.dumps(manifest, sort_keys=True, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text(encoding="utf-8") != payload:
            raise SystemExit("Private capture manifest missing or stale")
    else:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(payload, encoding="utf-8")
    print(f"{'Verified' if args.check else 'Created'} private capture manifest: "
          f"{sum(len(s['files']) for s in manifest['sources'])} file digests from {len(manifest['sources'])} sources")


if __name__ == "__main__":
    main()
