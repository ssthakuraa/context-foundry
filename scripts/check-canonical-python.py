#!/usr/bin/env python3
"""Check portable canonical vectors with an independent RFC 8785 implementation."""

import hashlib
import json
import math
from pathlib import Path

import rfc8785


MAX_SAFE_INTEGER = 2**53 - 1
VECTORS = Path(__file__).resolve().parents[1] / "packages/contracts/fixtures/canonical-vectors.json"


def reject_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate decoded JSON key")
        result[key] = value
    return result


def parse_safe_integer(raw):
    value = int(raw)
    if abs(value) > MAX_SAFE_INTEGER:
        raise ValueError("unsafe bare JSON integer")
    return value


def parse_finite_float(raw):
    value = float(raw)
    if not math.isfinite(value):
        raise ValueError("non-finite JSON number")
    return value


def reject_constant(raw):
    raise ValueError(f"invalid JSON constant: {raw}")


def strict_parse(raw):
    return json.loads(
        raw,
        object_pairs_hook=reject_duplicate_keys,
        parse_int=parse_safe_integer,
        parse_float=parse_finite_float,
        parse_constant=reject_constant,
    )


def jsonl_bytes(records):
    ids = set()
    for record in records:
        record_id = record.get("record_id")
        if not isinstance(record_id, str) or not record_id or record_id in ids:
            raise ValueError("missing or duplicate record_id")
        ids.add(record_id)
    ordered = sorted(records, key=lambda record: record["record_id"].encode("utf-16-be"))
    return b"".join(rfc8785.dumps(record) + b"\n" for record in ordered)


def main():
    vectors = json.loads(VECTORS.read_text(encoding="utf-8"))
    assert vectors["format"] == "context-foundry-canonical-vectors-1"
    for vector in vectors["valid"]:
        actual = rfc8785.dumps(strict_parse(vector["input"]))
        expected = vector["canonical"].encode("utf-8")
        assert actual == expected, vector["name"]
        assert hashlib.sha256(actual).hexdigest() == vector["sha256"], vector["name"]
    for vector in vectors["invalid"]:
        try:
            rfc8785.dumps(strict_parse(vector["input"]))
        except (ValueError, UnicodeError, rfc8785.CanonicalizationError):
            continue
        raise AssertionError(f"invalid vector accepted: {vector['name']}")
    for vector in vectors["jsonl_valid"]:
        actual = jsonl_bytes(vector["records"])
        assert actual == vector["jsonl"].encode("utf-8"), vector["name"]
        assert hashlib.sha256(actual).hexdigest() == vector["sha256"], vector["name"]
    for vector in vectors["jsonl_invalid"]:
        try:
            jsonl_bytes(vector["records"])
        except ValueError:
            continue
        raise AssertionError(f"invalid JSONL vector accepted: {vector['name']}")
    print(f"Verified {len(vectors['valid'])} valid/{len(vectors['invalid'])} invalid JSON and "
          f"{len(vectors['jsonl_valid'])} valid/{len(vectors['jsonl_invalid'])} invalid JSONL Python vectors")


if __name__ == "__main__":
    main()
