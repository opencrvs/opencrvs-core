---
name: birth-form-field-config
description: Per-role, per-field visibility/requirement rules for the Birth declaration form (informant type, Hospital Official, Legal Guardian, etc). Use when writing or debugging birth-event e2e specs in packages/testland - especially packages/testland/e2e/testcases/regression/scenarios/birth - to know in advance which fields/pages a given declaring role or informant type will actually see, instead of discovering it through live trial-and-error.
---

# Birth form field configuration

Source: Google Sheet `1k4mUufSo5q9iIkl5S3iYQjczOcgmvEYB`, tab gid `1122485860` ("Birth Declaration"). Full link: https://docs.google.com/spreadsheets/d/1k4mUufSo5q9iIkl5S3iYQjczOcgmvEYB/edit?gid=1122485860#gid=1122485860

Fetch it with `mcp__claude_ai_Google_Drive__read_file_content` (fileId above) - it's a native Google Sheet, so this returns clean CSV-ish text directly, no xlsx/base64/unzip dance needed.

Columns: `#, Label, Mandatory?, Analytics?, Field type, Options, Validation, Conditional logic, Secured?, Notes`. Rows are grouped under page headers: Introduction, Page 1 Informant's details, Page 2 Child's details, Page 3 Mother's details, Page 4 Father's details, Page 5 Supporting documents, Page 6 Review.

## This is a design spec, not the deployed truth - verify before trusting

This sheet describes intended/target behavior. It does **not** reliably match what's actually coded in `packages/countryconfig-template/src/events/birth/forms/pages/*.ts` today:

- The sheet's `Secured?` column is `FALSE` for every single row. The actual code has `secured: true` on several fields (confirmed by grepping the page files): `child.dob`, `child.placeOfBirth`, `child.birthLocation` (all three variants: health-facility/privateHome/other), `mother.dob`, `mother.address`, `father.dob`, `father.address`, `informant.email`, `informant.phoneNo`. Don't trust the sheet's column for this - grep the schema directly.
- The sheet marks most Informant/Mother/Father fields (Nationality, Form of ID, ID number, name, DOB, place of residence) as "HIDE if Hospital Official" - but live testing (Declaration 7, regression/scenarios/birth) showed a Hospital Official successfully filling and seeing all of these fields for a Legal Guardian informant and an available mother. Treat sheet-level per-field Hospital-Official hiding as aspirational/not-yet-implemented unless you reverify live.
- **What the sheet got right and code/live-testing confirmed**: the entire "Supporting documents" page is unconditionally absent for a Hospital-Official-submitted declaration - the review page for such a submission never renders an "Upload supporting documents" section at all (only Child/Informant/Mother/Father/Annotations show). This also lines up with `NOTIFY` being listed as a "pre-declaration action" in `packages/commons/src/events/ActionType.ts`, distinct from `DECLARE`/`REGISTER` ("declaration actions") - Hospital Officials typically only NOTIFY, not DECLARE.
- The sheet's note on row "Father's details unavailable" says: *"Mother's details unavailable is hidden for Hospital official, but Father's is not"* - **this is wrong, corrected via Declaration 9/10**: a direct live probe (Hospital Official Other, informant=Father) showed the "Mother's details are not available" checkbox renders fine (`count() === 1`). The original note was only an inference from Declaration 7 never having touched the toggle, not an actual confirmed absence - don't repeat that mistake; a feature merely not being used in one declaration isn't evidence it's hidden. Both parents' `detailsNotAvailable` toggles appear to work normally for Hospital Official Other.
- **New from Declaration 8**: `mother.dob`/`father.dob` genuinely don't render in the input form at all for Hospital Official Other - not just redacted on the record tab like other secured fields, but the date-of-birth fields (and the "Exact date of birth unknown" → Age fallback) are simply absent from the DOM, so there's nothing to fill or skip around. This is different from `mother.address`/`father.address` (also `secured: true`), which stay fully visible and editable for this role. So "secured" doesn't uniformly drive input-visibility - DOB specifically is hidden for this role, address isn't, and this isn't explained by any single flag in the schema or the sheet; it was only found by trying to fill the field live and watching `fillDate` time out waiting for a `dd` placeholder that never appears.

**Rule of thumb:** when the sheet and live behavior disagree, live behavior (or the current schema file) wins. Use the sheet for scenario ideas and to know a conditional *might* exist, then confirm the specifics with a quick live check (see [[feedback-e2e-domain-fallback]] for how to run one) before writing assertions against it.

## Other conditional-logic rules worth knowing (from the sheet, unverified against current code)

- Child's `Place of birth`: "IF Hospital Official disable/hide Residential Address and Other" / "IF Embassy disable/hide Health Institution" - i.e. a Hospital Official is meant to only be able to pick Health Institution, an Embassy-type user only Residential/Other.
- Child's `Health Institution` facility field: "SHOW if Health institution selected... IF Hospital Official default to their assigned location." Confirmed live: the facility list is scoped to the declaring user's own office/jurisdiction (`allowedLocations: user.jurisdiction(...)` in `child.ts`) - e.g. Hospital Official Other (`k.bwalya`) only ever sees "Ibombo District Hospital", not "Klow Village Hospital" (which belongs to a different office/user, e.g. plain Hospital Official / Community Leader). Don't hardcode a facility name across different declaring users - type a broad search substring (e.g. a single letter) and read back whatever options actually appear for that user before picking one.
- Father's `Same as mother's address` checkbox and address fields: sheet says "HIDE if Hospital Official" - consistent with Hospital Officials not handling parents' address details in general.
- Supporting documents: `Proof of assigned responsibility` and `Acquired child court document` both "SHOW if legal guardian" - i.e. when the informant is a Legal Guardian (and the documents page is actually reachable, which it isn't for Hospital Official), two extra document upload fields specific to legal guardianship appear.
- `Informant type` options per the sheet: Mother, Father, Grandfather, Grandmother, Legal Guardian, Self, Other. (Declarations already built in regression/scenarios have also exercised Brother/Sister successfully live, so the deployed `InformantType` enum is broader than this sheet's list - another sheet/code gap.)

## Related

[[reference-testland-birth-sample-data-sheet]] is the separate declaration-scenario sheet (10 sample rows) this field-config sheet complements - that one gives *what data* to fill in per declaration; this one gives *which fields will actually be visible* for the role/informant-type combination in play.
