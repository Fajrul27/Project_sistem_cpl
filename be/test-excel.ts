import * as xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import * as fs from 'fs';

async function main() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CPMK');
    worksheet.columns = [
        { header: 'No', key: 'no' },
        { header: 'Kode CPMK', key: 'kodeCpmk' },
        { header: 'Deskripsi', key: 'deskripsi' },
        { header: 'Mata Kuliah', key: 'mataKuliah' },
        { header: 'Level Taksonomi', key: 'levelTaksonomi' },
        { header: 'Mapping CPL', key: 'mappingCpl' },
        { header: 'Teknik Penilaian', key: 'teknikPenilaian' }
    ];
    worksheet.addRow({
        no: 1, kodeCpmk: 'CPMK-1', deskripsi: 'A', mataKuliah: 'B', levelTaksonomi: 'C',
        mappingCpl: 'CPL-05:100', teknikPenilaian: ''
    });
    const buffer = await workbook.xlsx.writeBuffer();
    fs.writeFileSync('test.xlsx', buffer);
    
    const wb = xlsx.readFile('test.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
    console.log("Parsed rows:", JSON.stringify(data, null, 2));
}
main();
