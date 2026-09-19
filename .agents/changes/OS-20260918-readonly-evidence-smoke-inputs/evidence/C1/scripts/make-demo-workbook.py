"""Create the isolated C1 reissue demonstration. Never modify the issued original."""
import sys, json, zipfile, re, importlib.util, hashlib
from pathlib import Path
import openpyxl
sys.dont_write_bytecode = True

source, target = map(Path, sys.argv[1:3])
target.mkdir(parents=True, exist_ok=True)
workbook = target / "orders.xlsx"
requirements = target / "orders.requirements.json"
if workbook.exists() or requirements.exists():
    raise SystemExit("Refusing to overwrite an existing demo issue")
original = (source / "orders.xlsx").read_bytes()
changes = {"xl/worksheets/sheet1.xml": {"C2": ("2", "3"), "F2": ("22.5", "33.75")},
           "xl/worksheets/sheet2.xml": {"B2": ("23.5", "34.75")}}
with zipfile.ZipFile(source / "orders.xlsx") as incoming, zipfile.ZipFile(workbook, "x") as outgoing:
    for info in incoming.infolist():
        data = incoming.read(info.filename)
        for cell, (before, after) in changes.get(info.filename, {}).items():
            pattern = rb'(<c\b[^>]*\br="' + cell.encode() + rb'"[^>]*>.*?<v>)' + re.escape(before.encode()) + rb'(</v>)'
            data, count = re.subn(pattern, lambda match: match[1] + after.encode() + match[2], data, flags=re.S)
            if count != 1:
                raise AssertionError("Expected exactly one original cell " + cell)
        outgoing.writestr(info, data)
spec = json.loads((source / "orders.requirements.json").read_text(encoding="utf-8"))
spec["description"] = "C1 demonstration issue-002: Orders C2 changed to3; formula caches independently calculated as33.75 and34.75. Original issue-001 remains immutable."
spec["sheets"]["Orders"]["cells"]["C2"]["value"] = 3
spec["sheets"]["Orders"]["cells"]["F2"]["cached"] = 33.75
spec["sheets"]["Summary"]["cells"]["B2"]["cached"] = 34.75
requirements.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
module_spec = importlib.util.spec_from_file_location("orders_validation", source / "validate-orders.py")
validator = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(validator)
count, formulas = validator.validate(workbook, spec, openpyxl)
values = openpyxl.load_workbook(workbook, data_only=True)
assert values["Orders"]["C2"].value == 3
assert values["Orders"]["F2"].value == round(3 * 12.5 * (1 - 0.1), 2) == 33.75
assert values["Summary"]["B2"].value == 33.75 + 0 - 8 + 9 == 34.75
assert values["Orders"]["A2"].value == "0001"
assert values["Types"]["B2"].value is True
values.close()
assert (source / "orders.xlsx").read_bytes() == original
result = {"originalSha256": hashlib.sha256(original).hexdigest(),
          "demoSha256": hashlib.sha256(workbook.read_bytes()).hexdigest(),
          "declaredCells": count, "formulasAndCaches": formulas,
          "expected": {"Orders!C2": 3, "Orders!F2": 33.75, "Summary!B2": 34.75, "Summary!B3": 4},
          "originalUnchanged": True, "nativeExcelRecalculation": "human step, not claimed"}
print(json.dumps(result, indent=2))
