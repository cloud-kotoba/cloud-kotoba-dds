# Shared GraphDB workbench — development API

Source: `src/cloud_kotoba_dds/graph_workbench.cljk`, extracted from
`net-kotobase/control-plane` (`kotobase.admin-page`, base `b381cafb`).
The source is shared; consumers must not copy the markup or browser controller.
Integration is verified with fixture data; live tenant operations require host qualification.

## Components

`view(options)` assembles nine reusable pure Hiccup panel components:
`overview-panel`, `graph-panel`, `ontology-panel`, `datoms-panel`, `query-panel`,
`pins-panel`, `keys-panel`, `activity-panel`, and `plan-panel`.
The exported `panels` data drives navigation. Individual panels can be rendered
independently; the browser controller currently requires the complete `view`.
Use one active workbench per document; host it in an existing SPA view.

`options` accepts host-owned `header`, `footer`, `title`, `heading-level`,
`benchmark`, `billing`, and `maturity` Hiccup slots. Billing, readiness claims,
account headers, telemetry, and login policy are not library defaults.
Include the DADS stylesheet, token bridge and exported `page-css`.

## Browser adapter

Load exported `script`, then call:

```javascript
const console = window.cloudKotobaGraph.mount(root, {
  request(path, options) { return applicationTransport(path, options); },
  hashPrefix: 'knowledge/',
  blockHref(cid) { return existingBlockURL(cid); },
  signOut() { return revokeApplicationSession(); }
});
// Abort host requests, dispose listeners, remove root and clear credentials.
console.dispose();
```

`request` returns a Promise<Response>. Paths are the existing Kotobase XRPC,
Pins and Audit contracts, not a new database protocol. A missing transport is
an error. No implicit fetch, session reuse, credential storage or authority
fallback exists in the component. The host must enforce origin, redirect,
credential and cancellation policy. The server authorizes every operation.
Write capability controls remain explicit. `dispose` removes routing/event
listeners; the host removes the root and aborts its in-flight requests.

Graph, datom table and inferred schema share a bounded query snapshot. The
existing limits remain 100 rows / 40 nodes / 80 edges. Ontology means observed
attributes/types here, not a complete declared ontology DB editor. Diagnostics
are dbStats/query-shape, not engine EXPLAIN/PROFILE. Existing migrations and
backup controls keep their original qualifications and limitations.

## Consumers and release order

- Kotobase: `kotobase.admin-page` supplies authenticated same-origin transport,
  header/footer, billing and existing readiness sections.
- Kotoba Cloud: `app-kotoba-cloud.knowledge-site` uses `#knowledge/<panel>`,
  explicit in-memory Kotobase credentials, fixed `https://kotobase.net`,
  `credentials: omit`, redirect refusal and abort-on-disconnect. Inference
  keys and Kotoba Cloud login do not automatically authorize graph access.

Use a **graph-dev dependency override** for local verification. Publish and merge this library first, pin that reachable commit
in both consumers, then run their normal builds before merging or deploying
consumers. Never pin the unpublished branch commit as a production dependency.
The local browser fixture test is in app-kotoba-cloud's
`test/graph-workbench-browser.cljk`; it mocks API responses and is not live
storage or account verification.
