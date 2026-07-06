function testHeaders(headers) {
    let emailIdx = 2, nimIdx = 3, namaIdx = 4, semesterIdx = 5, prodiIdx = 6, kelasIdx = 7;
    let hasHeader = false;
    for (let i = 1; i < headers.length; i++) {
        const val = String(headers[i] || '').toLowerCase().trim();
        if (val.includes('email') || val.includes('e-mail')) { emailIdx = i; hasHeader = true; }
        else if (val === 'nim' || val.includes('nomor induk')) { nimIdx = i; hasHeader = true; }
        else if (val.includes('nama')) { namaIdx = i; hasHeader = true; }
        else if (val.includes('semester')) { semesterIdx = i; hasHeader = true; }
        else if (val.includes('program studi') || val === 'prodi') { prodiIdx = i; hasHeader = true; }
        else if (val === 'kelas') { kelasIdx = i; hasHeader = true; }
    }
    return { hasHeader, emailIdx, nimIdx, namaIdx, semesterIdx, prodiIdx, kelasIdx };
}

console.log(testHeaders([undefined, 'No', 'Email', 'NIM', 'Nama Lengkap', 'Semester', 'Program Studi', 'Kelas']));
console.log(testHeaders([undefined, 'Email', 'NIM', 'Nama Lengkap', 'Semester', 'Program Studi', 'Kelas']));
