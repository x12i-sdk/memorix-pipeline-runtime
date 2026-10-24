import assert from 'node:assert/strict';
import { createMemoryOperationalStores } from '@x12i/memorix-pipeline-runtime';
import { createHash } from 'node:crypto';
const stores = createMemoryOperationalStores();
const data = { recordId: 'asset-1', status: 'reviewed' };
const artifact = await stores.artifacts.put({ orgId: 'fixture-org', runId: 'run-1', stepId: 'review', kind: 'review-output', retentionClass: 'ephemeral', mode: 'append',
  contentHash: createHash('sha256').update(JSON.stringify(data)).digest('hex'), data, ref: { collection: 'fixture-artifacts', count: 1 },
});
assert.deepEqual((await stores.artifacts.get('fixture-org', artifact.artifactId)).data, data);
assert.equal(await stores.artifacts.get('other-org', artifact.artifactId), null);
const lease = await stores.leases.lease({ orgId: 'fixture-org', runId: 'run-1', ownerId: 'worker-a', ttlMs: 60_000 });
assert(lease);
assert.equal(await stores.leases.lease({ orgId: 'fixture-org', runId: 'run-1', ownerId: 'worker-b', ttlMs: 60_000 }), null);
assert.equal(await stores.leases.release('fixture-org', lease.leaseKey, 'worker-a'), true);
console.log({ artifactId: artifact.artifactId, exclusiveLeaseVerified: true });
