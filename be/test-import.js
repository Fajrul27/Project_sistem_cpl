import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
const prisma = new PrismaClient();

async function testImport() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Mahasiswa');
  // Create a realistic header
  sheet.addRow(['No', 'Email', 'NIM', 'Nama Lengkap', 'Semester', 'Program Studi', 'Kelas']);
  sheet.addRow([1, 'test@gmail.com', '22E010099', 'Test User', 8, 'Informatika', 'A']);

  const errors = [];
  const successes = [];
  let rowNumber = 1;
  let isFirstRow = true;
  let emailIdx = 2, nimIdx = 3, namaIdx = 4, semesterIdx = 5, prodiIdx = 6, kelasIdx = 7;

  for (const row of sheet.getSheetValues()) {
      rowNumber++;
      if (!row || row.length === 0) continue;

      if (isFirstRow) {
          isFirstRow = false;
          let hasHeader = false;
          for (let i = 1; i < row.length; i++) {
              let cellVal = row[i];
              if (cellVal && typeof cellVal === 'object' && cellVal.richText) cellVal = cellVal.richText.map(r=>r.text).join('');
              const val = String(cellVal || '').toLowerCase().trim();
              if (val.includes('email') || val.includes('e-mail')) { emailIdx = i; hasHeader = true; }
              else if (val === 'nim' || val.includes('nomor induk')) { nimIdx = i; hasHeader = true; }
              else if (val.includes('nama')) { namaIdx = i; hasHeader = true; }
              else if (val.includes('semester')) { semesterIdx = i; hasHeader = true; }
              else if (val.includes('program studi') || val === 'prodi') { prodiIdx = i; hasHeader = true; }
              else if (val === 'kelas') { kelasIdx = i; hasHeader = true; }
          }
          if (hasHeader) continue;
      }

      function getCellValue(value) {
          if (value === null || value === undefined) return '';
          if (typeof value === 'object' && value.richText) return value.richText.map(rt => rt.text || '').join('');
          if (typeof value === 'object' && value.result !== undefined) return String(value.result).trim();
          if (typeof value === 'object' && !Array.isArray(value)) return '';
          return String(value).trim();
      }

      const email = getCellValue(row[emailIdx]);
      const nim = getCellValue(row[nimIdx]);
      const namaLengkap = getCellValue(row[namaIdx]);
      const semester = getCellValue(row[semesterIdx]);
      const programStudi = getCellValue(row[prodiIdx]);
      const kelas = getCellValue(row[kelasIdx]);

      if (!email || !nim || !namaLengkap) {
          if (email || nim || namaLengkap) errors.push(`Baris ${rowNumber}: Email, NIM, dan Nama Lengkap harus diisi`);
          continue;
      }

      try {
          // just test db queries
          console.log(`Processing: email=${email}, nim=${nim}, nama=${namaLengkap}`);
          const existing = await prisma.user.findUnique({ where: { email } });
          console.log(`Existing:`, existing ? 'Yes' : 'No');
      } catch (e) {
          errors.push(e.message);
      }
  }
  console.log("Errors:", errors);
}

testImport().finally(() => prisma.$disconnect());
