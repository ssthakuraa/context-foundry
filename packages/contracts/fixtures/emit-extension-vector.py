#!/usr/bin/env python3
"""Independent adopter-style 0.3.0 wire vector; Python stdlib only."""

import hashlib
import json
import sys


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def digest(value):
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


payload_schema = {
    "type": "object",
    "properties": {
        "artifact_type": {"type": "string", "minLength": 1, "maxLength": 128},
        "name": {"type": "string", "minLength": 1, "maxLength": 512},
    },
    "required": ["artifact_type", "name"],
    "additionalProperties": False,
}
profile = {
    "schema_version": "0.3.0",
    "kind": "acme.workflow",
    "semantic_major": 1,
    "payload_schema": payload_schema,
    "payload_schema_digest": digest(payload_schema),
    "projection_version": 1,
    "identity_scheme": "acme:workflow",
    "scheme_version": "1",
    "allowed_origins": ["source_declared"],
    "reference_roles": [],
}
profile["profile_digest"] = digest({key: value for key, value in profile.items() if key != "payload_schema"})
ref = {"kind": profile["kind"], "profile_digest": profile["profile_digest"]}
manifest = {
    "schema_version": "0.3.0",
    "protocol_major": 1,
    "adapter_id": "acme:python-workflow",
    "adapter_version": "1.0.0",
    "package_digest": "b" * 64,
    "role": "analyzer",
    "media_types": ["application/xml"],
    "languages": ["acme-workflow"],
    "config_schema_digest": "c" * 64,
    "emitted_profiles": [ref],
    "consumed_profiles": [],
    "parser_version": "1.0.0",
    "rule_version": "1.0.0",
    "requested_capabilities": ["capture.read"],
    "resource_limits": {"input_bytes": 65536, "output_bytes": 65536, "messages": 100, "wall_ms": 1000},
    "license": "Apache-2.0",
}
consumer = {
    "schema_version": "0.3.0",
    "consumer_id": "generic-search:1",
    "required_profiles": [ref],
    "accepted_profiles": [ref],
}
record = {
    "schema_version": "0.3.0",
    "record_id": "rec:workflow",
    "kind": "acme.workflow",
    "profile_digest": profile["profile_digest"],
    "identity": {"source_namespace": "repo:fixture", "scheme": "acme:workflow", "scheme_version": "1", "key": "repair-approval"},
    "producer_id": "acme:python-workflow",
    "owner_id": "team:fixture",
    "origin": "source_declared",
    "review": {"state": "not_required"},
    "payload": {"artifact_type": "workflow", "name": "Réparer 🔧"},
    "descriptor": {"name": "Réparer 🔧", "aliases": ["repair flow"], "locator_refs": ["ev:workflow"]},
    "references": [],
    "evidence_refs": ["ev:workflow"],
    "dependency_refs": [],
    "classification": "public",
}
locator = {
    "kind": "file",
    "evidence_id": "ev:workflow",
    "source_id": "repo:fixture",
    "snapshot_id": "snap:1",
    "revision_kind": "supplied_snapshot",
    "path": "workflows/repair.xml",
    "file_digest": "a" * 64,
}

sys.stdout.write(canonical({"profile": profile, "manifest": manifest, "consumer": consumer, "record": record, "locator": locator}) + "\n")
