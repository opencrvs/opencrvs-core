# Migration Naming Style Guide

This document defines the conventions for naming database migration files in this project. Clear, consistent naming helps ensure maintainability, traceability, and ease of collaboration.

---

## 📅 1. Use Timestamp Prefixes

Prefix each migration with a UTC timestamp in `YYYYMMDDHHMMSS` format. This guarantees correct ordering and avoids name collisions.

**Format:** `YYYYMMDDHHMMSS-description-of-change.sql`
**Example:** `20250520131500-add-status-column-to-orders.sql`

## 🔤 2. Use Descriptive, Verb-Based Names

Migration names should describe what the migration does using active, lowercase, underscore-separated words.

**Preferred Verbs:**

- `add`, `remove`, `rename`, `alter`, `drop`, `create`, `update`

**Examples:**

- `add-email-to-users`
- `remove-price-from-products`
- `rename-username-to-user-name-in-profiles`
- `create-orders-table`

---

## 🧼 3. Naming Rules

- Use **skebab-case** (`dashes-between-words`). This happens automatically when creating migrations through `node-pg-migrate`.
- Avoid camelCase or spaces
- Be specific, avoid vague names like `update-schema`
- Use named constraints for clarity and traceability (e.g. event-actions-check)
