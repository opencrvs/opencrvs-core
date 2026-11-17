# Migration Naming Style Guide

This document defines the conventions for naming database migration files in this project. Clear, consistent naming helps ensure maintainability, traceability, and ease of collaboration.

---

## 📅 1. Use Timestamp Prefixes

Prefix each migration with a millisecond Unix timestamp. This guarantees correct ordering and avoids name collisions. `pnpm create:events description-of-change` adds it for you.

**Format:** `<timestamp>_description-of-change.sql`
**Example:** `1786060800000_allow-null-system-clients-created-by.sql`

## 🔤 2. Use Descriptive, Verb-Based Names

Migration names should describe what the migration does using active, lowercase, dash-separated words.

**Preferred Verbs:**

- `add`, `remove`, `rename`, `alter`, `drop`, `create`, `update`

**Examples:**

- `add-email-to-users`
- `remove-price-from-products`
- `rename-username-to-user-name-in-profiles`
- `create-orders-table`

---

## 🧼 3. Naming Rules

- Use **kebab-case** (`dashes-between-words`). This happens automatically when creating migrations through `node-pg-migrate`.
- Never rename an existing migration. Deployed databases record migrations by file name, so a renamed file runs again. Some older migrations use underscores and keep their names.
- Avoid camelCase or spaces
- Be specific, avoid vague names like `update-schema`
- Use named constraints for clarity and traceability (e.g. event-actions-check)
