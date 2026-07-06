const ExcelJS = require('exceljs');

async function test() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Test');
  sheet.addRow(['H1', 'H2']);
  sheet.addRow(['D1', 'D2']);

  let rowNumber = 1;
  const values = sheet.getSheetValues();
  console.log("values:", values);

  for (const row of values) {
    rowNumber++;
    if (rowNumber === 2) {
      console.log("skipping rowNumber 2, row is:", row);
      continue;
    }
    console.log("rowNumber:", rowNumber, "row:", row);
  }
}

test();
