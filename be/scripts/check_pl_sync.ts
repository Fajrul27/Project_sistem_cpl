
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Mengecek Data Profil Lulusan (PL) dan Sinkronisasi CPL...");

    // 1. Get all Prodis
    const prodis = await prisma.prodi.findMany({
        include: {
            profilLulusan: {
                include: {
                    cplMappings: {
                        include: {
                            cpl: true
                        }
                    }
                }
            },
            cpl: true
        }
    });

    for (const prodi of prodis) {
        console.log(`\nProdi: ${prodi.nama}`);
        console.log(`  - Total CPL: ${prodi.cpl.length}`);
        console.log(`  - Total PL:  ${prodi.profilLulusan.length}`);

        if (prodi.profilLulusan.length === 0) {
            console.log(`  ⚠️  TIDAK ADA Profil Lulusan.`);
        } else {
            for (const pl of prodi.profilLulusan) {
                const cplCount = pl.cplMappings.length;
                console.log(`    > PL: ${pl.nama} (${pl.kode}) -> Terhubung ke ${cplCount} CPL`);
                if (cplCount === 0) {
                    console.log(`      ❌ PL ini belum terhubung ke CPL manapun (Tidak Sinkron)`);
                }
            }
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
