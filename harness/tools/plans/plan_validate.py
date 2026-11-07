#!/usr/bin/env python3
"""Validador del sistema de planes BareDo.

Uso:
    uv run --with jsonschema harness/tools/plans/plan_validate.py

Verifica:
    1. El schema cumple draft 2020-12.
    2. Templates (excepto plan.schema.json) validan contra el schema.
    3. Planes en docs/plans/ validan contra el schema.
    4. En planes: `plan.id` == nombre de archivo sin extension.
    5. Referencias: decisiones_ref -> decisiones, depende_de -> fases.

Salida esperada: `schema: valido`, `OK` en todo, `REFS ...: OK` en planes.
Cualquier FAIL/ID/REF bloquea avanzar al paso siguiente (harness/docs/PLANNING.md seccion 3).
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, SchemaError, ValidationError, validate

ROOT = Path(__file__).resolve().parents[3]
TEMPLATES = ROOT / "harness" / "docs" / "templates"
PLANS = ROOT / "harness" / "docs" / "plans"
SCHEMA = TEMPLATES / "plan.schema.json"


def _collect_refs(o, refs: set) -> None:
    """Recopila ids de decisión y fase referenciados en un documento de plan."""
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ("decisiones_ref", "depende_de") and isinstance(v, list):
                refs.update(v)
            else:
                _collect_refs(v, refs)
    elif isinstance(o, list):
        for i in o:
            _collect_refs(i, refs)


def main() -> int:
    schema = json.loads(SCHEMA.read_text())
    Draft202012Validator.check_schema(schema)
    print("schema: valido")

    failed = False

    for f in sorted(TEMPLATES.glob("*.json")):
        if f.name == "plan.schema.json":
            continue
        doc = json.loads(f.read_text())
        try:
            validate(instance=doc, schema=schema)
            print(f"OK   {f.relative_to(ROOT)}")
        except (ValidationError, SchemaError) as e:
            print(f"FAIL {f.relative_to(ROOT)}: {e}")
            failed = True

    for f in sorted(PLANS.glob("*.json")):
        doc = json.loads(f.read_text())
        try:
            validate(instance=doc, schema=schema)
            print(f"OK   {f.relative_to(ROOT)}")
        except (ValidationError, SchemaError) as e:
            print(f"FAIL {f.relative_to(ROOT)}: {e}")
            failed = True

        ok = True
        if doc["plan"]["id"] != f.stem:
            print(
                f"ID   {f.relative_to(ROOT)}: plan.id {doc['plan']['id']} != {f.stem}"
            )
            ok = False
        ids = {d["id"] for d in doc.get("decisiones", [])}
        fases = {fa["id"] for fa in doc.get("fases", [])}
        refs = set()
        _collect_refs(doc, refs)
        rotas = {r for r in refs if r not in ids and r not in fases}
        if rotas:
            print(f"REF  {f.relative_to(ROOT)}: {sorted(rotas)}")
            ok = False
        if ok:
            print(f"REFS {f.relative_to(ROOT)}: OK")
        failed = failed or not ok

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
