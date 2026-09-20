#!/usr/bin/env python3
"""Independent checks for the bounded, schema-valid semantic vector subset.

This intentionally does not implement JSON Schema or cross-record authority checks.
"""

import json
import hashlib
import re
from pathlib import Path

from jsonschema import Draft7Validator
import rfc8785

ROOT = Path(__file__).resolve().parents[1]
VECTORS = ROOT / "packages/contracts/fixtures/semantic-vectors.json"
SCHEMAS = ROOT / "packages/contracts/schemas"


def normalized_relative_path(path):
    parts = path.split("/")
    return (not path.startswith("/") and "\\" not in path
            and not re.search(r"[\x00-\x1f\x7f]", path)
            and not re.match(r"^[a-zA-Z]:", path)
            and all(part not in ("", ".", "..") for part in parts))


def valid_semantics(schema, value):
    if schema == "source_capture":
        return value["revision_kind"] != "git" or bool(value.get("revision_value"))
    if schema == "captured_file":
        return normalized_relative_path(value["path"])
    if schema == "evidence_locator":
        return ((value["revision_kind"] != "git" or bool(value.get("revision_value")))
                and normalized_relative_path(value["path"])
                and (value["kind"] != "file_range" or value["start_line"] <= value["end_line"])
                and ("byte_span" not in value
                     or value["byte_span"]["start"] < value["byte_span"]["end"]))
    if schema == "coverage":
        return (value["processed_count"] + value["failed_count"]
                + value["excluded_count"] <= value["eligible_count"])
    if schema == "engineering_symbol_payload":
        return (value["artifact_kind"] not in ("method", "constructor", "function")
                or bool(value.get("signature")))
    if schema == "business_rule_payload":
        applicability = value["applicability"]
        has_scope = bool(applicability.get("product_ids") or applicability.get("conditions"))
        return ((applicability["status"] != "bounded" or has_scope)
                and (applicability["status"] != "unknown" or not has_scope))
    if schema == "interface_operation_payload":
        has_http_fields = bool(value.get("http_method") and value.get("route_template"))
        return (has_http_fields if value["protocol"] == "http"
                else "http_method" not in value and "route_template" not in value)
    raise ValueError(f"unsupported semantic vector schema: {schema}")


def valid_artifact(artifact, body_validator):
    body = artifact["body"]
    if hashlib.sha256(rfc8785.dumps(body)).hexdigest() != artifact["body_digest"]:
        return False
    version = artifact["version"]
    if version == 1 and "previous_version" in artifact:
        return False
    if version > 1 and artifact.get("previous_version") != version - 1:
        return False
    if artifact["kind"] != "scope_map" or not body_validator.is_valid(body):
        return False  # Bounded checker only implements the scope-map body.
    questions = [question["question_id"] for question in body["questions"]]
    if len(set(questions)) != len(questions):
        return False
    for candidate in body["candidates"]:
        if candidate["basis"] == "evidence" and not candidate["evidence_refs"]:
            return False
        if not set(candidate["evidence_refs"]).issubset(artifact["evidence_refs"]):
            return False
    return True


def main():
    vectors = json.loads(VECTORS.read_text(encoding="utf-8"))
    assert vectors["format"] == "context-foundry-semantic-vectors-1"
    assert vectors["schema_version"] == "0.2.0"
    names = set()
    validators = {}
    needed = {vector["schema"] for vector in vectors["cases"] + vectors["shape_invalid"]}
    needed.update(("task_artifact", "scope_map_body"))
    for schema_name in needed:
        schema = json.loads((SCHEMAS / f"{schema_name}.schema.json").read_text(encoding="utf-8"))
        Draft7Validator.check_schema(schema)
        validators[schema_name] = Draft7Validator(schema)
    for vector in vectors["cases"]:
        assert vector["name"] not in names, vector["name"]
        names.add(vector["name"])
        assert validators[vector["schema"]].is_valid(vector["value"]), vector["name"]
        assert valid_semantics(vector["schema"], vector["value"]) is vector["valid"], vector["name"]
    for vector in vectors["shape_invalid"]:
        assert vector["name"] not in names, vector["name"]
        names.add(vector["name"])
        assert not validators[vector["schema"]].is_valid(vector["value"]), vector["name"]
    for vector in vectors["artifact_variants"]:
        assert vector["name"] not in names, vector["name"]
        names.add(vector["name"])
        artifact = {**vectors["artifact_base"], **vector["changes"]}
        assert validators["task_artifact"].is_valid(artifact), vector["name"]
        assert valid_artifact(artifact, validators["scope_map_body"]) is vector["valid"], vector["name"]
    print(f"Verified {len(vectors['cases'])} semantic and "
          f"{len(vectors['shape_invalid'])} shape-invalid Python vectors, "
          f"plus {len(vectors['artifact_variants'])} artifact variants")


if __name__ == "__main__":
    main()
