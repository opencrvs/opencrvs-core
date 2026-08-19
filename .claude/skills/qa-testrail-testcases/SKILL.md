---
name: qa-testrail-testcases
description: Convert a section from the regression TestRail workbook/JSON into a Playwright e2e spec under packages/testland/e2e/testcases/qa-testrail-testcases/, following this repo's e2e conventions.
---

# QA TestRail testcases → Playwright e2e specs

Goal: turn manually-written regression test cases into automated Playwright
specs living under `packages/testland/e2e/testcases/qa-testrail-testcases/`,
in the same style as the rest of `packages/testland/e2e/testcases/`.

Typical trigger phrasing: "automate the Escalate section from Custom
actions", "write the e2e tests for the Login suite's <section> section",
"do the next section in qa-testrail-testcases".

## Terminology — suite vs. section

- A **test suite** = the value of the `Test Suite`/`test_suite` column, e.g.
  "Custom actions", "Login", "Assign-Unassign", "Versioning of
  Administrative Structure".
- A **section** = the value of the `Section`/`section` column. One suite
  contains many sections (e.g. "Custom actions" contains Validate, Escalate,
  Attestation, Seal-Unseal).
- A **test case** = one row within a section (`Test Case Title` / `Steps` /
  `Expected Result`).

So "write me tests for the Validate section of Custom actions" means: find
the "Custom actions" suite, find "Validate" within it, and automate every
row grouped under that section. If the user names only a section without a
suite, either infer the suite from context (e.g. they're clearly continuing
work on a suite folder already in progress) or list the available suite
names and ask — don't guess when a section name could plausibly live in more
than one suite.

## Folder isolation — never edit outside this folder, fork only on real changes

Everything this skill writes or edits must stay inside
`packages/testland/e2e/testcases/qa-testrail-testcases/`. Never modify a file
outside that folder (`e2e/helpers.ts`, `e2e/constants.ts`, `e2e/utils.ts`,
`e2e/testcases/birth/helpers.ts`, `e2e/testcases/test-data/*.ts`, etc.) —
only import from them.

This folder's own `helpers.ts` / `constants.ts` / `utils.ts` exist **only**
for logic that genuinely differs from (or has no equivalent in) the
canonical files. The rule for every method a new spec needs:

- **Unchanged** — import it directly in the spec file from its canonical
  location (e.g. `formatV2ChildName`/`getIdByName` from
  `e2e/testcases/birth/helpers.ts`, `login`/`goToSection`/`joinValuesWith`
  from `e2e/helpers.ts`, `createDeclaration`/`getDeclaration` (rename on
  import, e.g. `as createBirthDeclaration`) from
  `e2e/testcases/test-data/birth-declaration.ts` or `death-declaration.ts`,
  `CREDENTIALS`/`GATEWAY_HOST` from `e2e/constants.ts`, `selectAction` from
  `e2e/utils.ts`). Do **not** re-export it through this folder's local files
  as a barrel/shim — import it at the point of use.
- **Needs even a tiny behavior change** to make a new test work — write a
  local version in this folder's `helpers.ts`/`utils.ts` instead (a genuine
  fork, not a copy of the whole canonical file), and import that local
  version everywhere it's needed within this folder. Note in a short comment
  what's different from the canonical version and why, so a future pass
  doesn't mistake it for an accidental duplicate.
- If a local fork's own dependencies (helpers it calls internally) are
  themselves unchanged, import those from canonical too, inside the local
  file - don't duplicate them just because they're needed by a fork.

Current example of this pattern: `helpers.ts` in this folder keeps only
`openRecordByTitle` (adds `.first()` to the row locator - some workqueues
here can render more than one matching row), `searchFromSearchBar` (forked
only because it must call the local `openRecordByTitle`), and
`createDuplicateDeathDeclaration` (no canonical equivalent - fixes
`deceased.idType`/`nid` defaults so two calls reliably collide under the
dedup config). `utils.ts` keeps only its forked `ensureAssignedToUser`
(adds a `toPass` retry with a settle wait - a single point-in-time read of
`assignedTo-value` was flaky here). Everything else these files used to
duplicate (createBirthDeclaration, createDeathDeclaration,
createDuplicateBirthDeclaration, login, getToken, triggerDeclarationAction,
validateActionMenuButton, fillDate, fillChildDetails, openBirthDeclaration,
drawSignature, uploadImageToSection, printAndExpectPopup, getLocations,
getAdministrativeAreas, getIdByName, formatName, joinValuesWith,
selectAction, CREDENTIALS, GATEWAY_HOST, etc.) was deleted from this
folder and is imported straight from its canonical file by whichever spec
needs it.

## Step 1 — Read the source

Source files, both under
`packages/testland/e2e/testcases/qa-testrail-testcases/manual test cases/regression/`:
- `regression_test_v2_1_web_online_4_cleaned.xlsx` — one sheet ("Regression
  Tests"), columns `Test Suite | Section | Test Case Title | Steps |
  Expected Result`.
- `regression_tests.json` — a pre-parsed export of that sheet: a flat array
  of ~190 rows shaped like:

  ```json
  {
    "id": "TC-0007",
    "test_suite": "Birth and Death forms",
    "section": "Birth form",
    "title": "Validate Mothers details page",
    "steps": ["...", "..."],
    "expected_results": ["...", "..."],
    "aligned": false,
    "raw_steps": "1. ...\n\n2. ...",
    "raw_expected_result": "1. ...\n\n2. ..."
  }
  ```

**Treat `regression_tests.json` as the primary source** — it's already split
into `steps`/`expected_results` arrays, so there's no merged-cell
forward-filling or manual re-parsing to do. Only open the raw `.xlsx` if a
row is still unclear after reading the JSON (use `read_xlsx.py`, same as
below, with sheet name `"Regression Tests"`).

The JSON is ~600KB — **never read it whole with the Read tool.** Use the
shipped filter script to pull out just the suite/section you're working on:

```bash
# List every (test_suite, section) pair, to check exact spelling/casing
python3 .claude/skills/qa-testrail-testcases/scripts/filter_regression.py \
  "packages/testland/e2e/testcases/qa-testrail-testcases/manual test cases/regression/regression_tests.json" \
  --list

# Filter to one suite (optionally one section within it), written to a file
python3 .claude/skills/qa-testrail-testcases/scripts/filter_regression.py \
  "packages/testland/e2e/testcases/qa-testrail-testcases/manual test cases/regression/regression_tests.json" \
  "Custom actions" /tmp/ca-escalate.json --section "Escalate"
```

If you ever need the raw `.xlsx` directly (e.g. to double check a mojibake'd
cell), the same zero-dependency reader works — no `xlsx`/`exceljs` npm
package or `openpyxl` is installed in this repo's tooling, don't try to
install one:

```bash
python3 .claude/skills/qa-testrail-testcases/scripts/read_xlsx.py \
  "packages/testland/e2e/testcases/qa-testrail-testcases/manual test cases/regression/regression_test_v2_1_web_online_4_cleaned.xlsx" \
  "Regression Tests" /tmp/regression-raw.json --group
```

Notes:
- **Check `aligned` on every row before zipping `steps[]` with
  `expected_results[]`.** When `aligned` is `false` (25 of 189 rows as of
  writing), the two arrays don't line up 1:1 — the source spreadsheet's step
  and result numbering didn't match. For those rows, read `raw_steps` /
  `raw_expected_result` as prose instead. The filter script flags which rows
  in its output are unaligned.
- There's no `e2eMapping`/hint column in this source — the folder/file
  convention in Step 2 is the only guidance for where a spec goes.
- `id` (`TC-XXXX`) is unique per row — useful for cross-checking against the
  workbook and for citing in your Step 6 report, but don't embed it in the
  generated spec (test titles/comments stay in the same untagged style as
  the existing specs).

## Step 2 — Ground yourself in the existing code before writing anything

Don't write assertions from the spreadsheet text alone — it's a
human-authored QA doc, not a spec, and can be internally inconsistent (see
"judgment calls" below). Cross-check against:

- **Folder/file convention** — apply this algorithm every time:
  1. **Suite folder**: `packages/testland/e2e/testcases/qa-testrail-testcases/<suite name, lowercased, as written in the Test Suite column>/`
     (e.g. "Custom actions" → folder `custom actions/`). Create it if it
     doesn't exist yet.
  2. **Section folder**: inside the suite folder, one folder per section,
     slugified (lowercase, spaces → hyphens) from the `Section` value, e.g.
     `Validate` → `validate/`, `Seal-Unseal` → `seal-unseal/`. Create it if
     it doesn't exist yet.
  3. **Suite abbreviation**: a short lowercase prefix for the suite, e.g.
     "Custom actions" → `ca`. **Always check for files already sitting in
     the suite folder first and reuse whatever prefix they use** — never
     invent a second prefix for the same suite. Only derive a fresh one
     (initials of the suite's significant words, skipping connectors like
     "and"/"of"/"&") when the suite folder is empty/new.
  4. **File name**: `<suite-abbrev>-<section-slug>.spec.ts` for the first
     (and usually only) file covering that section, e.g.
     `ca-validate.spec.ts`. If a section's test cases are too many/varied to
     sensibly fit in one file, split across multiple files and suffix the
     second and later ones with a number: `<suite-abbrev>-<section-slug>-2.spec.ts`,
     `-3.spec.ts`, etc. (the first file stays unnumbered).
  5. This gives, in full:
     `packages/testland/e2e/testcases/qa-testrail-testcases/<suite name>/<section-slug>/<suite-abbrev>-<section-slug>[-N].spec.ts`.
- **Check for an existing stub first** — a target file may already exist
  (possibly empty, or a `.gitkeep` placeholder folder) rather than needing
  creation from scratch. Read before writing.
- `packages/testland/e2e/HOW-TO-WRITE-A-TEST.md` and `README.md` — the
  anti-flakiness rules are mandatory, not optional style: use
  `openRecordByTitle` to select a record from a workqueue (never a raw
  click), `ensureAssignedToUser` before acting on a record,
  `triggerDeclarationAction` / `waitForCorrectionAction` to fire+confirm an
  action (they wait on the real network responses), never an arbitrary
  `page.waitForTimeout`.
- Shared helpers — read before reimplementing anything: `packages/testland/e2e/helpers.ts`,
  `e2e/utils.ts`, `e2e/constants.ts` (has `CREDENTIALS`, the seeded
  usernames, and environment URLs), `e2e/mobile-helpers.ts`.
- `e2e/testcases/test-data/birth-declaration.ts`, `death-declaration.ts` (and
  the `-with-father-brother` / `-with-mother-father` variants) — seed
  records via the tRPC API (`createDeclaration`) instead of driving the
  whole form, unless the test case is specifically about form-filling
  behavior.
- **`ActionType.NOTIFY` needs a `record.notify`-scoped token — most roles
  don't have it.** Per Farajaland's default role seed
  (`packages/testland/src/data-seeding/roles/roles.ts`), only
  `CREDENTIALS.HOSPITAL_OFFICIAL`/`HOSPITAL_OFFICIAL_OTHER` and
  `CREDENTIALS.COMMUNITY_LEADER` carry `record.notify` — Registration
  Officer, Registrar, and every other seeded role do not, and calling
  `createDeclaration(token, undefined, ActionType.NOTIFY)` (or the raw
  `event.actions.notify.request.mutate`) with one of those tokens throws
  `TRPCClientError: FORBIDDEN` (this is enforced server-side via
  `ACTION_SCOPE_MAP` in `packages/commons/src/events/scopes.ts`, not a bug).
  When a test needs "role X inherits a record that was notified", notify
  with a Hospital Official/Community Leader token and only switch to role
  X's token for the *subsequent* API calls (assign — unrestricted — and
  reject, declare, register, etc., whichever scope role X actually holds).
- `e2e/testcases/birth/helpers.ts` and `e2e/testcases/print-certificate/birth/helpers.ts` —
  shared utilities living under a misleadingly specific path
  (`openRecordByTitle`, `formatV2ChildName`, `getAdministrativeAreas`,
  `getIdByName`, etc. are used repo-wide, not just for birth).
- Search `e2e/testcases/` for specs that already exercise the same
  action/workqueue/flag — especially `custom-actions-and-flags/`,
  `jurisdiction/`, `action-menu/`. They're ground truth for real locators,
  copy text, and behavior, and are usually more reliable than the
  spreadsheet's "Expected Result" column.
- **Jurisdiction ("within their jurisdiction") cases**: visibility/permission
  is resolved from the **creating user's own `primaryOfficeId`**
  (`createdAtLocation` passed to `createDeclaration` is silently ignored for
  a normal user token — only honored for a system/integration token). To
  produce a record "outside" a district, create it with a token from a user
  actually based there (e.g. `CREDENTIALS.REGISTRATION_OFFICER_PUALULA`),
  not just by overriding the birth/death location form fields. Mirror
  `jurisdiction/administrative-area-restrictions.spec.ts`.
- When exact copy text, field ids, or SHOW/ENABLE conditionals matter, read
  the event config directly: `packages/testland/src/events/birth/index.ts`,
  `.../death/index.ts`. **Don't assume birth and death share copy for "the
  same" action** — they're configured independently and can drift (e.g.
  death's `VALIDATE_DECLARATION` supportingCopy was found still saying
  "Approving this declaration confirms..." — a copy-paste leftover from
  Approve). When source, spreadsheet, and sibling event disagree, that's a
  signal to flag a possible product bug rather than silently picking one.

## Step 3 — Confirm live behavior when still uncertain

For anything not confidently pinned down by source + existing specs (exact
modal copy, whether a field is required, action menu contents/ordering after
a given action, etc.), check the real app instead of guessing:

- URL: `https://register.e2e.opencrvs.dev/` — this is the deployed
  `CLIENT_URL` for `DOMAIN=e2e.opencrvs.dev`, matching
  `packages/testland/e2e/constants.ts`. The suite falls back to
  `qa.opencrvs.dev` automatically (via `e2e/global-setup.ts`) if
  `e2e.opencrvs.dev` doesn't respond — if the app seems to be behaving
  unexpectedly, check which domain the run actually resolved to.
- Login: username + password, then a 6-digit verification code. Password is
  `TEST_USER_PASSWORD` (`'test'`) from `constants.ts`; the code is always
  `000000` in this environment (see `getAuthTokens` in `e2e/helpers.ts` — the
  harness hardcodes it, and it works identically when logging in by hand).
- Usernames: any value from the `CREDENTIALS` map in `e2e/constants.ts`, e.g.
  `f.katongo` (Registration Officer, Ibombo), `k.mweene` (Registrar, Ibombo),
  `m.owen` (Provincial Registrar), `c.lungu` (Registrar General),
  `m.simbaya` (Registration Officer, Pualula — useful for jurisdiction
  cases). Pick whichever role the test case is actually about.
- Drive it with the `playwright-cli` skill or the `mcp__playwright__*`
  browser tools: navigate, snapshot, click through the exact flow the test
  case describes, and read off the true copy/labels/test-ids before encoding
  them into assertions. **In this environment `playwright-cli` isn't
  installed globally** — invoke it as `npx --yes @playwright/cli@latest
  <command>` (e.g. `npx --yes @playwright/cli@latest open <url>`). If the
  first call complains the skill doesn't match the tool version, run `npx
  --yes @playwright/cli@latest install --skills` once to sync it, then
  continue normally. Verified working end-to-end (login → 6-digit code →
  PIN setup → profile check) against `register.qa.opencrvs.dev` (the
  environment in use before the e2e.opencrvs.dev switch — behavior should be
  identical) as Community Leader (`g.phiri`).
- **This is a shared, persistent environment**, not a throwaway sandbox.
  Read-only exploration and assigning/validating your own freshly-created
  throwaway declaration is fine. Be careful firing hard-to-reverse actions
  (Register, Revoke, Archive, delete) against records you didn't create —
  other people or scheduled test runs may depend on their state. Prefer
  creating your own declaration to poke at over acting on unrelated existing
  records.

## Step 4 — Write the spec

Follow the conventions already established in sibling files (see Step 2).
In short: `test.step(...)` blocks per sub-scenario, the `CREDENTIALS` map for
logins, API-seeded declarations for anything not specifically about
form-filling, `openRecordByTitle` / `ensureAssignedToUser` /
`triggerDeclarationAction` / `selectAction` / `searchFromSearchBar` /
`switchEventTab` for interaction, `getByTestId('status-value' | 'flags-value')`
for record state, and `#action-Dropdown-Content li` `.allTextContents()` for
action-menu contents.

**`Assign`/`Unassign` in the source data means "whichever applies", not
"both appear together".** The regression workbook/JSON has already been
normalized so that any expected-result list needing this is written as the
combined `Assign/Unassign` (see e.g. the Archive section's expected results)
— if you ever find a row that still lists them as two separate items in the
same action-menu list (that combination can't both be true for one record),
that's a leftover the normalization missed: fix the wording in both
`regression_tests.json` (plain JSON string edit) and the `.xlsx` (there's no
shared-strings table in this workbook — the cell text lives inline in
`xl/worksheets/sheet1.xml`; edit that XML entry directly inside the zip with
Python's stdlib `zipfile`, no `openpyxl` needed) so the next person reading
either source doesn't hit the same ambiguity. In the spec itself, assert only
the one real action ('Assign' when unassigned, 'Unassign' when assigned) —
never both.

**Two behaviors of this app's action system catch nearly every new spec —
check for both on every `test.step` that follows a `triggerDeclarationAction`
/ `selectAction` confirm:**

1. **Every action navigates the user out of the record view.** Confirming
   an action (Archive, Register, Reject, Declare/Notify/Register "with
   edits", etc.) sends the client back to the workqueue/search-result the
   record was opened from — the record's own overview page is gone by the
   time the action's response resolves. **Never assert `status-value` /
   `flags-value` / the action menu on the same page right after the
   trigger** — first re-find the record (`searchFromSearchBar(page, name)`,
   or click the relevant workqueue button then `openRecordByTitle`), *then*
   assert. This applies even inside a shared helper that wraps
   `triggerDeclarationAction` (e.g. an `archiveAndAssertActions`-style
   function) — the re-navigation has to happen inside the helper, before any
   assertion, not just at call sites. (Exception: `Cancel`-ing a
   confirmation modal never navigates anywhere, so checking the still-open
   record right after a Cancel is fine.)
2. **The Audit tab stays empty until the record is assigned to the viewing
   user.** Most actions leave the record unassigned afterwards (that's *why*
   the post-action menu shows `Assign`, not `Unassign`), so
   `switchEventTab(page, 'Audit')` needs an `ensureAssignedToUser(page, ...)`
   call immediately before it — even if the record was assigned earlier in
   the same test, re-check after every re-navigation from rule 1. Checking
   `status-value`/`flags-value` does **not** require assignment; only the
   Audit tab's content does.

Both of these were found (as 3 failing tests) in the Archive section's specs
after they'd already passed review — treat them as load-bearing, not
optional polish.

**Switching users on the same `page` mid-test**: two separate things need to
both be right, or the client is left in a half-navigated state (symptoms:
`refreshToken` intermittently undefined, navigation to `CLIENT_URL` hanging,
or a later step failing to find the search bar because login never actually
finished) — this was hit and fixed while automating "Escalate", not
theoretical:
1. **Always `logout(page)` immediately before `login(page, ...)` when
   switching to a different user on the same `page`.** This matches the
   established pattern (e.g. `archival/archive-and-unarchive.spec.ts`,
   `birth/save-and-delete-drafts.spec.ts`) — it forces a clean transition
   through the login app instead of racing the client's own "detect the
   refreshToken belongs to a different user, refetch their offline data"
   logic. Only the very first login of a test (nothing to log out of yet)
   skips this.
2. **`skipPin` is per-*user*, not per-browser** — the client stores each
   user's PIN in IndexedDB keyed by their `userID` (`packages/client/src/views/PIN/CreatePin.tsx`,
   `packages/client/src/declarations/index.ts`), and that storage persists
   for the rest of the test regardless of `logout()` (logout only clears the
   current session pointer, not `USER_DATA`). So pass `skipPin: true` **only
   when the exact same role has already logged in earlier in this same
   test** (a genuine repeat) — never for a role's first appearance, even if
   other roles logged in before it. Get this backwards (e.g. `true` for
   every login after the first, regardless of who) and the first-time user
   gets stuck on a PIN-creation screen the test never fills in.

## Step 5 — Verify before calling it done

- Typecheck **only the new file's presence in the output** — the whole
  package (`pnpm run test:compilation` from `packages/testland`) currently
  has pre-existing, unrelated failures from a stale `@opencrvs/toolkit`
  build (`@opencrvs/toolkit/conditionals` missing exports, etc.). Run it,
  then confirm none of the reported errors reference your new file's path —
  don't try to fix the pre-existing ones.
- Lint the new file specifically:
  `pnpm exec eslint -c eslint.config.js "<path to the new spec>"` (run from
  `packages/testland`).
- Running the spec against a live stack (`pnpm e2e-dev` locally, or
  `NODE_TLS_REJECT_UNAUTHORIZED=0 DOMAIN=<env>.opencrvs.dev pnpm e2e` per the
  e2e README) is ideal but optional — call it out as unverified if no stack
  is available in the current session.

## Step 6 — Report back

Include: which suite/section/rows were covered (cite the `TC-XXXX` ids even
though they're not in the spec file itself) and where the file was written;
any judgment call made because the spreadsheet was ambiguous or
self-contradictory, with reasoning (note if a row had `aligned: false` and
needed the raw prose fields instead of the parsed arrays); and any suspected
product bugs discovered while cross-checking source vs. spreadsheet vs. live
app.
