# Migration Naming Style Guide

This document defines the conventions for naming database migration files in this project. Clear, consistent naming helps ensure maintainability, traceability, and ease of collaboration.

---

## 📅 1. Use Timestamp Prefixes

Prefix each migration with a UTC timestamp in `YYYYMMDDHHMMSS` format. This guarantees correct ordering and avoids name collisions.

**Format:** `YYYYMMDDHHMMSS_description_of_change.sql`
**Example:** `20250520131500_add_status_column_to_orders.sql`

## 🔤 2. Use Descriptive, Verb-Based Names

Migration names should describe what the migration does using active, lowercase, underscore-separated words.

**Preferred Verbs:**

- `add`, `remove`, `rename`, `alter`, `drop`, `create`, `update`

**Examples:**

- `add_email_to_users`
- `remove_price_from_products`
- `rename_username_to_user_name_in_profiles`
- `create_orders_table`

---

## 🧼 3. Naming Rules

- Use **snake_case** (`underscores_between_words`)
- Avoid camelCase or spaces
- Be specific, avoid vague names like `update_schema`
