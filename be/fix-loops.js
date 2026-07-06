import fs from 'fs';
const content = fs.readFileSync('/media/hdd/PERKULIAHAN/PKL/Project_sistem_cpl/be/server/controllers/users-controller.ts', 'utf-8');

// The file is currently broken. I will replace the exact catch blocks to add the closing brace.
const fixed = content.replace(
    /            } catch \(error: any\) {\n                errors\.push\(`Baris \$\{rowNumber\} \(\$\{email\}\): \$\{error\.message \|\| 'Gagal menyimpan data'\}\`\);\n            }\n        }\n\n        res\.json\(\{/g,
    `} catch (error: any) {
                errors.push(\`Sheet \${worksheet.name} Baris \${rowNumber} (\${email}): \${error.message || 'Gagal menyimpan data'}\`);
            }
        }
        } // end of worksheet loop

        res.json({`
);

fs.writeFileSync('/media/hdd/PERKULIAHAN/PKL/Project_sistem_cpl/be/server/controllers/users-controller.ts', fixed);
console.log("Fixed loops");
