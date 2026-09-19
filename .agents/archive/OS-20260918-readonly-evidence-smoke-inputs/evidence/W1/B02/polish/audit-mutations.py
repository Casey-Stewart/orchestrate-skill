"""Disposable, independent XML corruptions; invokes the actual validator CLI."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from xml.etree import ElementTree as ET
from zipfile import ZipFile

source, run = map(Path, sys.argv[1:])
fixture = source / 'tests/fixtures/smoke-inputs'
requirements = fixture / 'orders.requirements.json'
workbook = fixture / 'orders.xlsx'
validator = fixture / 'validate-orders.py'
spec = json.loads(requirements.read_text(encoding='utf-8'))
ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
with ZipFile(workbook) as archive:
    original = {name: archive.read(name) for name in archive.namelist()}
before = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in (workbook, requirements, validator)}
results = []


def negative(label, member, mutate, expected):
    data = dict(original)
    root = ET.fromstring(data[member])
    mutate(root)
    data[member] = ET.tostring(root, encoding='utf-8', xml_declaration=True)
    path = run / ('corrupt-' + str(len(results) + 1) + '.xlsx')
    with ZipFile(path, 'x') as archive:
        for name, content in data.items():
            archive.writestr(name, content)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()  # Recomputed digest is never semantic proof.
    command = ['python', str(validator), str(path), str(requirements)]
    result = subprocess.run(command, text=True, capture_output=True)
    output = result.stdout + result.stderr
    assert result.returncode == 1 and expected in output, (label, result.returncode, output)
    assert hashlib.sha256(path.read_bytes()).hexdigest() == digest, 'validator wrote corrupted input'
    record = dict(label=label, command=command, exit=result.returncode, output=output.strip(), sha256=digest)
    results.append(record)
    print(f'PASS rejected {label}: {output.strip()}', flush=True)


def find_cell(root, address):
    cell = root.find(f'.//{ns}c[@r="{address}"]')
    if cell is None:
        row_num = ''.join(c for c in address if c.isdigit())
        row = root.find(f'.//{ns}row[@r="{row_num}"]')
        cell = ET.SubElement(row, ns + 'c', r=address)
    return cell


for index, (sheet, sheet_spec) in enumerate(spec['sheets'].items(), 1):
    member = f'xl/worksheets/sheet{index}.xml'
    for address, wanted in sheet_spec['cells'].items():
        kind = wanted['type']
        def break_value(root, address=address, wanted=wanted, kind=kind):
            cell = find_cell(root, address)
            if kind == 'formula':
                cell.find(ns + 'f').text += '+1'
            elif kind in ('integer', 'number'):
                cell.find(ns + 'v').text = str(wanted['value'] + 7)
            elif kind == 'date':
                cell.find(ns + 'v').text = str(int(cell.find(ns + 'v').text) + 1)
            elif kind == 'boolean':
                cell.find(ns + 'v').text = '0'
            else:
                for child in list(cell):
                    cell.remove(child)
                cell.set('t', 'inlineStr')
                ET.SubElement(ET.SubElement(cell, ns + 'is'), ns + 't').text = 'CORRUPTED'
        negative(sheet + '!' + address + ' incorrect value/formula', member, break_value, sheet + '!' + address)
        if kind == 'formula':
            def break_cache(root, address=address, wanted=wanted):
                find_cell(root, address).find(ns + 'v').text = str(wanted['cached'] + 9)
            negative(sheet + '!' + address + ' incorrect numeric cache', member, break_cache, sheet + '!' + address + '.cached')
            def remove_cache(root, address=address):
                cell = find_cell(root, address)
                cell.remove(cell.find(ns + 'v'))
            negative(sheet + '!' + address + ' missing cache', member, remove_cache, sheet + '!' + address + '.cached')


def bool_zero(root):
    find_cell(root, 'C3').set('t', 'b')
negative('boolean false is not numeric zero', 'xl/worksheets/sheet1.xml', bool_zero, 'Orders!C3.integer')
def false_cache(root):
    find_cell(root, 'F3').set('t', 'b')
negative('boolean false is not numeric cache zero', 'xl/worksheets/sheet1.xml', false_cache, 'Orders!F3.cached')
def empty_string(root):
    cell = find_cell(root, 'C2')
    cell.set('t', 'inlineStr')
    ET.SubElement(ET.SubElement(cell, ns + 'is'), ns + 't').text = ''
negative('empty string is not an actually empty cell', 'xl/worksheets/sheet3.xml', empty_string, 'Types!C2.empty')
def numeric_id(root):
    cell = find_cell(root, 'A2')
    cell.remove(cell.find(ns + 'is'))
    cell.set('t', 'n')
    ET.SubElement(cell, ns + 'v').text = '1'
negative('numeric ID loses text and leading zeroes', 'xl/worksheets/sheet1.xml', numeric_id, 'Orders!A2.text')
def wrong_format(root):
    find_cell(root, 'E2').set('s', '0')
negative('missing percent number format', 'xl/worksheets/sheet1.xml', wrong_format, 'Orders!E2.format')
def wrong_sheet(root):
    root.find(ns + 'sheets')[0].set('name', 'Wrong')
negative('wrong sheet name', 'xl/workbook.xml', wrong_sheet, 'sheetOrder')
def wrong_date_system(root):
    root.find(ns + 'workbookPr').set('date1904', '1')
negative('wrong Excel date system', 'xl/workbook.xml', wrong_date_system, 'dateSystem')
def external_link(root):
    root[0].set('TargetMode', 'External')
negative('external relationship', '_rels/.rels', external_link, 'noExternalLinks')
def macros(root):
    for child in root:
        if child.get('PartName') == '/xl/workbook.xml':
            child.set('ContentType', 'application/vnd.ms-excel.sheet.macroEnabled.main+xml')
negative('macro-enabled content type', '[Content_Types].xml', macros, 'noMacros')
def numeric_boolean(root):
    # Python equality treats 1 == True; this specifically proves logical type.
    find_cell(root, 'B2').set('t', 'n')
negative('numeric 1 is not boolean true', 'xl/worksheets/sheet3.xml', numeric_boolean, 'Types!B2.boolean')

after = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in (workbook, requirements, validator)}
assert before == after, 'validator mutated fixture inputs'
(run / 'mutation-report.json').write_text(json.dumps(dict(results=results, inputHashesBefore=before, inputHashesAfter=after), indent=2) + '\n', encoding='utf-8')
print(f'PASS {len(results)} concrete corruptions rejected by named requirements; fixture and disposable input bytes unchanged')
