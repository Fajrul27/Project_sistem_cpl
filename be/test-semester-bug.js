function getIdx(headers) {
    let emailIdx = 2, nimIdx = 3, namaIdx = 4, semesterIdx = 5, prodiIdx = 6, kelasIdx = 7, angkatanIdx = 8;
    for (let i = 1; i < headers.length; i++) {
        const val = String(headers[i] || '').toLowerCase().trim();
        if (val.includes('email') || val.includes('e-mail')) { emailIdx = i; }
        else if (val.includes('nim') || val.includes('nomor induk')) { nimIdx = i; }
        else if (val.includes('nama')) { namaIdx = i; }
        else if (val.includes('semester')) { semesterIdx = i; }
        else if (val.includes('program studi') || val === 'prodi') { prodiIdx = i; }
        else if (val === 'kelas') { kelasIdx = i; }
        else if (val.includes('angkatan')) { angkatanIdx = i; }
    }
    return { emailIdx, nimIdx, namaIdx, semesterIdx, prodiIdx, kelasIdx, angkatanIdx };
}

const headers = [undefined, 'Email', 'NIM', 'Nama Lengkap', 'Semester', 'Program Studi', 'Kelas'];
console.log(getIdx(headers));
