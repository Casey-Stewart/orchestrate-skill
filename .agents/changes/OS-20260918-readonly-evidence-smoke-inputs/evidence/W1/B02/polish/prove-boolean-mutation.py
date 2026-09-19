"""Show the numeric-one negative rejects the exact hunter-identified mutant."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from xml.etree import ElementTree as ET
from zipfile import ZipFile

source, run = map(Path, sys.argv[1:])
fixture = source / 'tests/fixtures/smoke-inputs'
validator = fixture / 'validate-orders.py'
original = validator.read_bytes()
strict = b'valid = cell.data_type == "b" and type(actual) is bool and actual is value'
assert original.count(strict) == 1
mutant = run / 'validate-orders-permissive-mutant.py'
with mutant.open('xb') as output:
    output.write(original.replace(strict, b'valid = actual == value'))
ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
corrupt = run / 'numeric-one-boolean.xlsx'
with ZipFile(fixture / 'orders.xlsx') as original_zip, ZipFile(corrupt, 'x') as output:
    for name in original_zip.namelist():
        data = original_zip.read(name)
        if name == 'xl/worksheets/sheet3.xml':
            root = ET.fromstring(data)
            cell = root.find(f'.//{ns}c[@r="B2"]')
            assert cell.get('t') == 'b' and cell.find(ns + 'v').text == '1'
            cell.set('t', 'n')
            data = ET.tostring(root, encoding='utf-8', xml_declaration=True)
        output.writestr(name, data)
digest_before = hashlib.sha256(corrupt.read_bytes()).hexdigest()
records = []
for label, program, expected_exit in [('candidate', validator, 1), ('permissive equality mutant', mutant, 0)]:
    command = ['python', str(program), str(corrupt), str(fixture / 'orders.requirements.json')]
    result = subprocess.run(command, text=True, capture_output=True)
    text = result.stdout + result.stderr
    assert result.returncode == expected_exit, (label, result.returncode, text)
    if label == 'candidate':
        assert 'Types!B2.boolean' in text and "found 1" in text, text
    else:
        assert 'PASS' in text, text
    records.append(dict(label=label, command=command, exit=result.returncode, output=text.strip()))
    print(f'{label}: exit {result.returncode}: {text.strip()}')
assert hashlib.sha256(corrupt.read_bytes()).hexdigest() == digest_before
assert validator.read_bytes() == original
(run / 'boolean-mutation-proof.json').write_text(json.dumps(dict(records=records, inputSha256=digest_before,
    candidateValidatorSha256=hashlib.sha256(original).hexdigest(), productionUnchanged=True), indent=2) + '\n', encoding='utf-8')
print('PASS new numeric-one negative assertion kills the exact permissive boolean validator mutant; production/input bytes unchanged')
