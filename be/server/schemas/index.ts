// Central export for backend schemas and inferred types
import { z } from 'zod';

// Export all schemas
export * from './common.schema.js';
export * from './auth.schema.js';
export * from './user.schema.js';
export * from './academic.schema.js';
export * from './grading.schema.js';
export * from './other.schema.js';

// Import for type inference
import { authSchemas } from './auth.schema.js';
import { userSchemas } from './user.schema.js';
import { academicSchemas } from './academic.schema.js';
import { gradingSchemas } from './grading.schema.js';
import { otherSchemas } from './other.schema.js';

// Inferred Types for Frontend Consumption
// Auth
export type LoginInput = z.infer<typeof authSchemas.login>;
export type RegisterInput = z.infer<typeof authSchemas.register>;

// User
export type UserCreate = z.infer<typeof userSchemas.create>;
export type UserUpdate = z.infer<typeof userSchemas.update>;

// Academic
export type Fakultas = z.infer<typeof academicSchemas.fakultas>;
export type Prodi = z.infer<typeof academicSchemas.prodi>;
export type MataKuliah = z.infer<typeof academicSchemas.mataKuliah>;
export type CPL = z.infer<typeof academicSchemas.cpl>;
export type CPMK = z.infer<typeof academicSchemas.cpmk>;
export type SubCPMK = z.infer<typeof academicSchemas.subCpmk>;

// Grading
export type TeknikPenilaian = z.infer<typeof gradingSchemas.teknikPenilaian>;
export type Rubrik = z.infer<typeof gradingSchemas.rubrik>;
export type NilaiBatch = z.infer<typeof gradingSchemas.nilaiBatch>;
export type NilaiSingle = z.infer<typeof gradingSchemas.nilaiSingle>;
export type Kuesioner = z.infer<typeof gradingSchemas.kuesioner>;
export type Evaluasi = z.infer<typeof gradingSchemas.evaluasi>;

// Other
export type ProfilLulusan = z.infer<typeof otherSchemas.profilLulusan>;
export type VisiMisi = z.infer<typeof otherSchemas.visiMisi>;
export type SettingsUpdate = z.infer<typeof otherSchemas.settingsUpdate>;
export type NilaiCpl = z.infer<typeof otherSchemas.nilaiCpl>;
