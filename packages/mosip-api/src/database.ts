import DatabaseSync, { Database } from "better-sqlite3";

/*
 * Lightweight SQLite database for storing transaction id with a JWT token
 *
 * OpenCRVS Core issues a record-specific token used to confirm the registration after it is received from MOSIP.
 * Optimally, MOSIP could receive this token as metadata and return it back in WebSub to avoid storage, but this is not currently supported by MOSIP.
 */

const DATABASE_SCHEMA = `
  CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  ) STRICT
`;

let database: Database;

export const initSqlite = (path: string) => {
  database = new DatabaseSync(path);

  const tableExists = database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'",
    )
    .get();

  if (!tableExists) {
    database.exec(DATABASE_SCHEMA);
  }

  return { wasCreated: !tableExists, wasConnected: tableExists, database };
};

export const insertTransaction = (
  id: string,
  token: string,
  registrationNumber: string,
) =>
  database
    .prepare(
      "INSERT INTO transactions (id, token, registration_number) VALUES (?, ?, ?)",
    )
    .run(id, token, registrationNumber);

export const getTransactionAndDiscard = (id: string) => {
  const remove = database
    .prepare(
      "DELETE FROM transactions WHERE id = ? RETURNING token, registration_number",
    )
    .get(id) as { token: string; registration_number: string } | undefined;

  if (!remove) {
    throw new Error(`Transaction with id '${id}' not found.`);
  }

  return {
    token: remove.token,
    registrationNumber: remove.registration_number,
  };
};

/**
 * Retrieves all transactions from the database.
 *
 * @warning
 * This function is intended for **debugging purposes only** as it exposes sensitive data.
 */
export const getAllTransactions = () => {
  return database
    .prepare(
      "SELECT id, registration_number, token, created_at FROM transactions",
    )
    .all() as Array<{
    id: string;
    registration_number: string;
    token: string;
    created_at: string;
  }>;
};

export const exit = () => database.close();
