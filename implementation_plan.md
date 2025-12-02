# Implementation Plan - OBE Enhancements (Rubric & CQI)

This plan outlines the steps to implement the recommended OBE features: **Assessment Rubrics** and **Continuous Quality Improvement (CQI)** / Course Evaluation.

## User Review Required

> [!IMPORTANT]
> **Database Changes**: This update involves adding new tables (`Rubrik`, `RubrikKriteria`, `RubrikLevel`, `NilaiRubrik`, `EvaluasiMataKuliah`). Please ensure your database is backed up before applying changes.

## Proposed Changes

### 1. Database Schema (`be/prisma/schema.prisma`)

#### [NEW] Rubric System
*   `Rubrik`: Stores rubric metadata, linked to `TeknikPenilaian`.
*   `RubrikKriteria`: Criteria for the rubric (e.g., "Completeness", "Accuracy").
*   `RubrikLevel`: Performance levels for each criterion (e.g., "Excellent", "Good").
*   `NilaiRubrik`: Stores the selected level for a student's grade.

#### [NEW] CQI System
*   `EvaluasiMataKuliah`: Stores lecturer's evaluation and improvement plan for a course at the end of the semester.

### 2. Backend (`be/server`)

#### [NEW] `routes/rubrik.ts`
*   `POST /`: Create a rubric for a specific `TeknikPenilaian`.
*   `GET /:teknikPenilaianId`: Get rubric details.
*   `PUT /:id`: Update rubric.

#### [NEW] `routes/evaluasi.ts`
*   `POST /`: Submit course evaluation (CQI).
*   `GET /mata-kuliah/:mkId`: Get evaluations for a course.

#### [MODIFY] `routes/nilai-teknik.ts`
*   Update grading logic to support "Rubric Mode". If a rubric exists, the score is calculated automatically based on selected levels.

### 3. Frontend (`fe/src`)

#### [NEW] `pages/dashboard/RubrikManager.tsx`
*   UI to create and edit rubrics.

#### [NEW] `pages/dashboard/EvaluasiMataKuliah.tsx`
*   Form for lecturers to input root cause analysis and improvement plans.

#### [MODIFY] `pages/dashboard/InputNilaiTeknik.tsx`
*   Add option to grade using Rubric if available.

## Verification Plan

### Automated Tests
*   Verify Prisma schema validity.
*   Test API endpoints for creating/retrieving rubrics and evaluations.

### Manual Verification
1.  **Rubric Flow**:
    *   Create a Rubric for a "Tugas".
    *   Input grades using the Rubric UI.
    *   Verify the final score is calculated correctly based on weights.
2.  **CQI Flow**:
    *   Login as Dosen.
    *   Submit an evaluation for a course.
    *   Verify the data is saved and retrievable.
