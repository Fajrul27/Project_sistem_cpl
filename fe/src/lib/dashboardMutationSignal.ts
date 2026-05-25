/**
 * dashboardMutationSignal.ts
 *
 * Lightweight cross-page mutation signal for the dashboard cache.
 *
 * When any page saves data that affects dashboard aggregates
 * (nilai, CPL mapping, CPMK, etc.), call `signalDashboardMutation()`.
 * The dashboard will detect this on its next mount/visit and re-fetch fresh data.
 *
 * Uses localStorage so the signal persists across SPA navigation.
 */

const MUTATION_KEY = 'dashboard_last_mutation_at';

/**
 * Signal that dashboard-relevant data was mutated.
 * Call this after any successful save/delete of:
 *   - nilai teknik (batch save, import)
 *   - CPL / CPMK mappings
 *   - mata kuliah (create/update/delete)
 */
export function signalDashboardMutation(): void {
    localStorage.setItem(MUTATION_KEY, Date.now().toString());
}

/**
 * Get the timestamp of the last mutation signal (ms since epoch).
 * Returns 0 if never signalled.
 */
export function getLastMutationTime(): number {
    return parseInt(localStorage.getItem(MUTATION_KEY) || '0', 10);
}
