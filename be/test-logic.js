function testRow(email, nim, namaLengkap) {
    let errors = [];
    let rowNumber = 4;
    if (!email || !nim || !namaLengkap) {
        if (email || nim || namaLengkap) {
            errors.push(`Baris ${rowNumber}: Email, NIM, dan Nama Lengkap harus diisi`);
        }
    }
    return errors;
}

console.log("All empty:", testRow('', '', ''));
console.log("One filled:", testRow('filled', '', ''));
console.log("Two filled:", testRow('filled', 'filled', ''));
