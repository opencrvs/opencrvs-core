# A record's prefix owns its attachments

Every attachment lives under `events/<eventId>/`. Deleting a record deletes its prefix. A sweep deletes every object under the prefix that the record does not reference. We chose this after finding that the Review page wrote a signature to the bucket root, bound to no record, where it survived the deletion of the record it belonged to.

## Considered options

**A walk over the event document.** Collect every path the event names, then delete those paths. The code did this and it failed in two ways. It read only accepted actions' declarations, so it never saw annotations or drafts. It also cannot see a file that nothing references yet, which is what an abandoned signature is. Widening the walk means whoever adds a field type that can hold a path has to add it to the walk as well, and that coupling produced the bug.

**Server-derived keys in the documents service.** Have documents take a typed owner and build the key itself. We rejected this because documents is a blob store with no knowledge of events. It can check the shape of a prefix but never that the prefix names a real record. Deriving the key belongs in the events service.

## Consequences

**Documents authorizes deletion by scope, not by object ownership.** `deleteDocument` refused unless the caller's id matched the object's `created-by`. That returned 403 on the ordinary flow where one user uploads and another acts, and it hid the failure. A prefix delete cannot be expressed that way. Authorization now rests on the scope the caller already needed to act on the record. We removed the ownership branch in `deleteDocument`, and the gateway's `DELETE /files` proxy as the client's inline delete was its only consumer. The upload handler keeps its own ownership check on replacement, which is separate code and unaffected.

**Rejected actions count as references.** `getFilePathsFromEvent` excluded them. That is right for computing current state and wrong for deciding what to erase, because a rejected action stays in the document and keeps naming its files. Its only caller is the sweep, so the exclusion was a decision about what to erase rather than about state.

**Deleting a record never reaches a shared user asset.** A registrar's signature lives under `users/<userId>/` and every record they sign references it. A sweep only ever runs inside a record's prefix, so it cannot reach that signature. This is the main reason to prefer a prefix over a reference list even where a list would work. A walk that learned about `createdBySignature` would delete one registrar's signature out of every record they had ever signed.

**`attachments.upload` takes an `eventId`.** The route accepted an optional free-form `path`, so an integrator could write an attachment to the bucket root, outside every prefix and where no sweep lists it. The client had the same hole, and this one is reachable through the public API. The route now takes an `eventId` and derives the key itself. We still accept `path` for a deprecation period, and reject an empty one.

**Drafts are confined to the declare action.** A draft can name a file that no action references, and the only things that reach such a file are deleting the record's prefix and the sweep that runs with the next action. `DraftInput` now accepts only `DECLARE`. DECLARE is available on a created record, which can still be deleted, and on a record part way through an edit, which is about to be declared or registered. Moving a user to another office or changing their role drops the drafts they were working on, and a created record whose only content was a draft has nothing left in it, so `user.update` deletes the record in the same transaction and sweeps its prefix once that transaction has committed.

**Forward-only.** Attachments already written to the bucket root are live data in the wrong place, not garbage. They resolve correctly and no sweep should touch them. They also sit outside every prefix permanently, so deleting a record that holds one leaks it. We accepted that instead of moving objects, because the set is bounded and stops growing once the client can no longer omit a prefix.

**A sweep that cannot delete now reports it.** The previous implementation discarded the result of every delete, so a 403 and a success looked the same.
