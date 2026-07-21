const fs = require('fs');
const readline = require('readline');

async function parseDump() {
    const fileStream = fs.createReadStream('sistem_cpl(Dummy).sql');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const users = {};
    const profiles = {}; // userId -> profile
    const cpmks = {};
    const cpls = {};
    const cpmkMappings = {}; // cplId -> array of {cpmkId, bobot}
    
    let currentTable = '';

    console.log("Parsing database dump...");

    for await (const line of rl) {
        if (line.startsWith('INSERT INTO `users`')) {
            const matches = line.match(/\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(/,\s*/);
                    if (parts.length > 2) {
                        const id = parts[0].replace(/['(]/g, '');
                        const email = parts[1].replace(/[']/g, '');
                        users[id] = email;
                    }
                });
            }
        }
        else if (line.startsWith('INSERT INTO `profiles`')) {
            const matches = line.match(/\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(/,\s*/);
                    if (parts.length > 5) {
                        const id = parts[0].replace(/['(]/g, '');
                        const userId = parts[1].replace(/[']/g, '');
                        const name = parts[2].replace(/[']/g, '');
                        const nim = parts[3].replace(/[']/g, '');
                        if (name !== 'NULL') {
                            profiles[userId] = { name, nim: nim !== 'NULL' ? nim : '-' };
                        }
                    }
                });
            }
        }
        else if (line.startsWith('INSERT INTO `cpmk`')) {
            const matches = line.match(/\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(/,\s*/);
                    if (parts.length > 2) {
                        const id = parts[0].replace(/['(]/g, '');
                        const kode = parts[1].replace(/[']/g, '');
                        cpmks[id] = kode;
                    }
                });
            }
        }
        else if (line.startsWith('INSERT INTO `cpl`')) {
            const matches = line.match(/\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(/,\s*/);
                    if (parts.length > 2) {
                        const id = parts[0].replace(/['(]/g, '');
                        const kode = parts[1].replace(/[']/g, '');
                        cpls[id] = kode;
                    }
                });
            }
        }
        else if (line.startsWith('INSERT INTO `cpmk_cpl_mapping`')) {
            const matches = line.match(/\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(/,\s*/);
                    if (parts.length > 4) {
                        const cpmkId = parts[1].replace(/[']/g, '');
                        const cplId = parts[2].replace(/[']/g, '');
                        const bobot = parseFloat(parts[3].replace(/[']/g, ''));
                        if (!cpmkMappings[cplId]) cpmkMappings[cplId] = [];
                        cpmkMappings[cplId].push({ cpmkId, bobot });
                    }
                });
            }
        }
    }

    console.log("Parsing Nilai...");
    
    // Now pass 2 to get nilai
    const fileStream2 = fs.createReadStream('sistem_cpl(Dummy).sql');
    const rl2 = readline.createInterface({
        input: fileStream2,
        crlfDelay: Infinity
    });

    const nilaiCpmk = {}; // mhsId -> cpmkId -> nilai
    const nilaiCpl = {}; // mhsId -> cplId -> nilai
    
    for await (const line of rl2) {
        if (line.startsWith('INSERT INTO `nilai_cpmk`')) {
            const matches = line.match(/\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(/,\s*/);
                    if (parts.length > 5) {
                        const mhsId = parts[1].replace(/[']/g, '');
                        const cpmkId = parts[2].replace(/[']/g, '');
                        const nilai = parseFloat(parts[4].replace(/[']/g, ''));
                        
                        if (!nilaiCpmk[mhsId]) nilaiCpmk[mhsId] = {};
                        nilaiCpmk[mhsId][cpmkId] = nilai;
                    }
                });
            }
        }
        else if (line.startsWith('INSERT INTO `nilai_cpl`')) {
            const matches = line.match(/\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(/,\s*/);
                    if (parts.length > 5) {
                        const mhsId = parts[1].replace(/[']/g, '');
                        const cplId = parts[2].replace(/[']/g, '');
                        const nilai = parseFloat(parts[4].replace(/[']/g, ''));
                        
                        if (!nilaiCpl[mhsId]) nilaiCpl[mhsId] = {};
                        nilaiCpl[mhsId][cplId] = nilai;
                    }
                });
            }
        }
    }

    console.log("-----------------------------------------");
    console.log("DATA RELASIONAL DITEMUKAN");
    
    // Pick one CPL that has mappings and grades
    let targetCplId = Object.keys(cpmkMappings).find(cplId => cpmkMappings[cplId].length > 1);
    
    if (targetCplId) {
        console.log(`CPL TERPILIH: ${cpls[targetCplId]}`);
        const cpmksRelated = cpmkMappings[targetCplId];
        console.log("Terdiri dari CPMK:");
        cpmksRelated.forEach(rel => {
            console.log(` - ${cpmks[rel.cpmkId]}: Bobot ${rel.bobot}%`);
        });
        
        console.log("\nMAHASISWA YANG MEMILIKI NILAI:");
        let count = 0;
        for (const mhsId of Object.keys(nilaiCpl)) {
            if (nilaiCpl[mhsId][targetCplId]) {
                const profile = profiles[mhsId];
                if (!profile) continue;
                
                console.log(`\n${count+1}. ${profile.name} (NIM: ${profile.nim})`);
                
                cpmksRelated.forEach(rel => {
                    const nCpmk = nilaiCpmk[mhsId]?.[rel.cpmkId] || 0;
                    console.log(`   > ${cpmks[rel.cpmkId]} (Bobot ${rel.bobot}%): ${nCpmk}`);
                });
                
                const nCpl = nilaiCpl[mhsId][targetCplId];
                console.log(`   >> NILAI CPL: ${nCpl}`);
                
                count++;
                if (count >= 5) break;
            }
        }
    } else {
        console.log("Tidak ditemukan CPL yang memenuhi syarat!");
    }
}

parseDump().catch(console.error);
