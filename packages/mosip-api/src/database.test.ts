import test, { it } from "node:test";
import * as db from "./database";
import assert from "node:assert";

test("SQLite", async () => {
  await it("inserts and removes transactions", () => {
    const { database } = db.initSqlite(":memory:");

    db.insertTransaction("1", "token1", "registrationNumber1");
    db.insertTransaction("2", "token2", "registrationNumber2");
    db.insertTransaction("3", "token3", "registrationNumber3");
    db.insertTransaction("4", "token4", "registrationNumber4");

    assert.strictEqual(
      database.prepare("SELECT * FROM transactions").all().length,
      4,
    );

    db.getTransactionAndDiscard("1");
    db.getTransactionAndDiscard("2");
    db.getTransactionAndDiscard("3");
    db.getTransactionAndDiscard("4");

    assert.strictEqual(
      database.prepare("SELECT * FROM transactions").all().length,
      0,
    );

    db.exit();
  });

  await it("throws on registration number conflict", () => {
    db.initSqlite(":memory:");

    assert.throws(() => {
      db.insertTransaction("2", "token2", "registrationNumber1");
      db.insertTransaction("1", "token1", "registrationNumber1");
    });

    db.exit();
  });
});
