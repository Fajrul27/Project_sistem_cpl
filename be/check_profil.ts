import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    let output = 'Checking Profil Lulusan Data...\n';

    const profils = await prisma.profilLulusan.findMany({
        include: {
            cplMappings: true,
            prodi: true
        }
    });

    output += `Total Profil Lulusan: ${profils.length}\n`;

    if (profils.length === 0) {
        output += 'No Profil Lulusan found.\n';
    } else {
        profils.forEach(p => {
            output += `- [${p.kode}] ${p.nama} (Prodi: ${p.prodi?.nama}, ID: ${p.prodiId})\n`;
            output += `  Mappings: ${p.cplMappings.length} CPLs\n`;
            output += `  isActive: ${p.isActive}\n`;
        });
    }

    const users = await prisma.profile.findMany({
        where: {
            namaLengkap: {
                contains: 'Eko Santoso'
            }
        },
        include: {
            user: true,
            prodi: true
        }
    });

    output += '\nFound Users matching "Eko Santoso":\n';
    users.forEach(u => {
        output += `- ${u.namaLengkap} (User ID: ${u.userId}, Prodi: ${u.prodi?.nama}, Prodi ID: ${u.prodiId})\n`;
    });

    fs.writeFileSync('check_profil_output.txt', output);
    console.log('Output written to check_profil_output.txt');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
