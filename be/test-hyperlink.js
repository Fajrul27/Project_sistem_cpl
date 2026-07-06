const ExcelJS = require('exceljs');

async function test() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Test');
    sheet.getCell('A1').value = {
        text: 'mhs01@gmail.com',
        hyperlink: 'mailto:mhs01@gmail.com'
    };
    const row = sheet.getRow(1);
    const value = row.getCell(1).value;
    console.log("Hyperlink value:", value);
    
    function getCellValue(val) {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && val.richText) return val.richText.map(rt => rt.text || '').join('');
        if (typeof val === 'object' && val.result !== undefined) return String(val.result).trim();
        if (typeof val === 'object' && !Array.isArray(val)) {
            if (val.text) return String(val.text).trim(); // Fix for hyperlink
            return '';
        }
        return String(val).trim();
    }
    console.log("Parsed:", getCellValue(value));
}
test();
