#!/usr/bin/env python3
"""Reviewed synthetic XML workflow adapter for the bounded process protocol."""

import base64
import hashlib
import json
import sys
import xml.etree.ElementTree as ET


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def digest(value):
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def emit(value):
    sys.stdout.write(canonical(value) + "\n")


def run():
    lines = [json.loads(line) for line in sys.stdin]
    if len(lines) != 3 or lines[0].get("type") != "job" or lines[1].get("type") != "file" or lines[2] != {"type": "end_input"}:
        raise ValueError("expected exactly one approved file")
    header, source_file, _ = lines
    capture = header["capture"]
    declared = header["files"][0]
    data = base64.b64decode(source_file["bytes_base64"], validate=True)
    if source_file["path"] != declared["path"] or hashlib.sha256(data).hexdigest() != declared["file_digest"]:
        raise ValueError("source bytes do not match declared file")
    if len(data) > 65536 or b"<!DOCTYPE" in data.upper() or b"<!ENTITY" in data.upper():
        raise ValueError("unsupported XML input")
    root = ET.fromstring(data)
    if root.tag != "workflow" or len(root) or not root.attrib.get("name") or len(root.attrib) != 1:
        raise ValueError("unsupported workflow shape")
    name = root.attrib["name"]
    profile = next(item for item in header["profile_digests"] if item["kind"] == "acme.workflow")
    evidence_id = "ev:" + hashlib.sha256((source_file["path"] + declared["file_digest"]).encode()).hexdigest()
    locator = {
        "kind": "file", "evidence_id": evidence_id,
        "source_id": capture["source_id"], "snapshot_id": capture["snapshot_id"],
        "revision_kind": capture["revision_kind"], "path": declared["path"],
        "file_digest": declared["file_digest"],
    }
    if "revision_value" in capture:
        locator["revision_value"] = capture["revision_value"]
    record = {
        "schema_version": "0.3.0", "record_id": "rec:" + hashlib.sha256((source_file["path"] + name).encode()).hexdigest(),
        "kind": "acme.workflow", "profile_digest": profile["profile_digest"],
        "identity": {"source_namespace": capture["source_id"], "scheme": "acme:workflow", "scheme_version": "1", "key": name},
        "producer_id": "acme:python-workflow", "owner_id": capture["authority_id"],
        "origin": "source_declared", "review": {"state": "not_required"},
        "payload": {"artifact_type": "workflow", "name": name},
        "descriptor": {"name": name, "aliases": [], "locator_refs": [evidence_id]},
        "references": [], "evidence_refs": [evidence_id], "dependency_refs": [],
        "classification": declared["classification"],
    }
    coverage = {
        "schema_version": "0.2.0", "source_id": capture["source_id"],
        "capture_digest": digest(capture), "adapter_id": "acme:python-workflow",
        "artifact_family": "workflow.xml", "supported_patterns": ["single workflow name"],
        "eligible_count": 1, "processed_count": 1, "failed_count": 0, "excluded_count": 0,
        "known_unsupported": ["nested workflow steps", "external entities"], "diagnostic_refs": [],
        "status": "partial", "reason": "One bounded XML shape; no execution semantics.",
    }
    content = {"locators": [locator], "records": [record], "coverage": [coverage], "diagnostics": []}
    emit({"type": "result", "protocol_major": 1, "job_id": header["job_id"],
          "adapter_id": "acme:python-workflow", "input_digest": header["input_digest"]})
    emit({"type": "locator", "value": locator})
    emit({"type": "record", "value": record})
    emit({"type": "coverage", "value": coverage})
    emit({"type": "end_result", "counts": {key: len(value) for key, value in content.items()},
          "content_digest": digest(content)})


if __name__ == "__main__":
    try:
        run()
    except (ValueError, KeyError, ET.ParseError, StopIteration):
        sys.exit(2)
