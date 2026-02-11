# ToolMove Remediation Tasks

Date: 2026-02-11

## Task Checklist

- [x] Restore and harden linting baseline with strict `no-explicit-any` and hook dependency checks.
- [x] Remove `any` usage across app state, query mapping, and catch blocks.
- [x] Introduce shared domain types for Supabase data used by views/forms.
- [x] Create a concrete task tracker documenting completed remediation work.

## Completed Work Notes

1. Added `src/types/domain.ts` for shared app record types (`Department`, `Line`, `Station`, `Reason`, `ToolMove`, `WeldTouchup`, `Profile`).
2. Added `src/lib/errors.ts` with a shared `getErrorMessage()` helper for safe unknown error handling.
3. Updated components (`App`, forms, list views, scanner/camera, auth, activity) to use explicit types and remove `any`.
4. Reworked effects in scanner/camera/activity to satisfy React Hook dependency requirements without disabling lint checks.
5. Re-enabled strict lint rules in `.eslintrc.cjs` for `@typescript-eslint/no-explicit-any` and `react-hooks/exhaustive-deps`.
