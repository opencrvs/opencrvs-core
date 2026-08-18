#!/usr/bin/env python3
"""
Reads a .xlsx workbook without any third-party dependency (no `xlsx`/`exceljs`
npm package or `openpyxl` is installed in this repo's tooling). An .xlsx file
is a zip of XML parts, so this uses only the stdlib: zipfile + xml.etree.

Usage:
  # 1. List sheet (tab) names in the workbook
  python3 read_xlsx.py "<path-to-workbook.xlsx>"

  # 2. Dump one sheet's rows as JSON to a file (always write to a file, not
  #    stdout — on Windows the console is cp1252 and will throw
  #    UnicodeEncodeError on the em-dashes/checkmarks/curly-quotes these
  #    sheets contain).
  python3 read_xlsx.py "<path-to-workbook.xlsx>" "<Sheet Name>" out.json

  # 3. Same, but also group rows into sections (see note below) and emit
  #    [{ section, cases: [{ title, steps, expected, e2eMapping }] }, ...]
  python3 read_xlsx.py "<path-to-workbook.xlsx>" "<Sheet Name>" out.json --group

Note on "Section": in these sheets, Section is a merged cell — only the
first row of a section has a non-empty Section value; subsequent rows
belong to the same section until the next non-empty Section value. Rows
without --group give you the raw grid; --group forward-fills Section and
buckets rows under it (assuming the header row is
Section/Title/Steps (Step)/Steps (Expected Result)/e2e mapping).
"""
import sys
import zipfile
import re
import json
from xml.etree import ElementTree as ET

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}


def col_to_index(cell_ref):
    letters = re.match(r'([A-Z]+)', cell_ref).group(1)
    idx = 0
    for c in letters:
        idx = idx * 26 + (ord(c) - ord('A') + 1)
    return idx - 1


def load_shared_strings(z):
    if 'xl/sharedStrings.xml' not in z.namelist():
        return []
    root = ET.fromstring(z.read('xl/sharedStrings.xml'))
    return [
        ''.join(t.text or '' for t in si.findall('.//main:t', NS))
        for si in root.findall('main:si', NS)
    ]


def load_sheet_map(z):
    wb_root = ET.fromstring(z.read('xl/workbook.xml'))
    sheets = [
        (
            sheet.get('name'),
            sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        )
        for sheet in wb_root.findall('.//main:sheets/main:sheet', NS)
    ]
    rels_root = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid_to_target = {rel.get('Id'): rel.get('Target') for rel in rels_root}
    return [(name, rid_to_target.get(rid)) for name, rid in sheets]


def read_sheet_rows(z, sheet_path, shared_strings):
    sheet_path = sheet_path.lstrip('/')
    if not sheet_path.startswith('xl/'):
        sheet_path = 'xl/' + sheet_path
    sheet_root = ET.fromstring(z.read(sheet_path))

    rows_data = []
    for row in sheet_root.findall('.//main:sheetData/main:row', NS):
        row_cells = {}
        max_col = 0
        for c in row.findall('main:c', NS):
            col_idx = col_to_index(c.get('r'))
            max_col = max(max_col, col_idx)
            cell_type = c.get('t')
            v = c.find('main:v', NS)
            is_elem = c.find('main:is', NS)
            value = ''
            if is_elem is not None:
                value = ''.join(t.text or '' for t in is_elem.findall('.//main:t', NS))
            elif v is not None:
                value = shared_strings[int(v.text)] if cell_type == 's' else (v.text or '')
            row_cells[col_idx] = value
        rows_data.append([row_cells.get(i, '') for i in range(max_col + 1)])
    return rows_data


def group_by_section(rows):
    header, *data_rows = rows
    grouped = []
    current = None
    for row in data_rows:
        row = row + [''] * (len(header) - len(row))
        record = dict(zip(header, row))
        if record.get('Section', '').strip():
            current = {'section': record['Section'].strip(), 'cases': []}
            grouped.append(current)
        if current is None:
            continue
        if not any(v.strip() for v in record.values() if isinstance(v, str)):
            continue
        current['cases'].append({
            'title': record.get('Title', ''),
            'steps': record.get('Steps (Step)', ''),
            'expected': record.get('Steps (Expected Result)', ''),
            'e2eMapping': record.get('e2e mapping', '')
        })
    return grouped


def main():
    path = sys.argv[1]
    sheet_name_filter = sys.argv[2] if len(sys.argv) > 2 else None
    out_path = sys.argv[3] if len(sys.argv) > 3 else None
    group = '--group' in sys.argv[4:]

    z = zipfile.ZipFile(path)
    shared_strings = load_shared_strings(z)
    sheets = load_sheet_map(z)

    if sheet_name_filter is None:
        print("Sheets found:")
        for name, target in sheets:
            print(f"  {name} -> {target}")
        return

    target_sheet = next(
        (target for name, target in sheets
         if name.strip().lower() == sheet_name_filter.strip().lower()),
        None
    )
    if not target_sheet:
        print(f"Sheet '{sheet_name_filter}' not found")
        sys.exit(1)

    rows = read_sheet_rows(z, target_sheet, shared_strings)
    output_obj = group_by_section(rows) if group else rows
    output = json.dumps(output_obj, ensure_ascii=False)

    if out_path:
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(output)
    else:
        sys.stdout.buffer.write(output.encode('utf-8'))


if __name__ == '__main__':
    main()
