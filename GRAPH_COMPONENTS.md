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
`benchmark`, `billing`, and `maturity` Hiccup slots.
`:intro? false` drops the workbench heading and lead for a host whose page
heading already names it (one fact, one home); the tenant line stays.
The overview leads with the database list; every database field offers the
catalog as a `datalist` (`#kb-db-options`) and starts on the first usable
database, and a row's Open loads the knowledge map directly.

The graph panel is a knowledge map (2026-09-25). One read of the chosen
window (100 / 500 / 1000 facts, default 500) builds one model that every view
renders from: kinds of things (from the attribute namespace, e.g.
`:paper/title` → `paper`), each thing named by a name-like attribute
(`name`, `title`, `label`, …), and links wherever a value is another loaded
thing. The map shows kind cards (count, fields, examples), a kind graph
(`paper —author→ person`), one kind's members, and one thing's facts and
neighbours in both directions. The ontology panel is the same model as a
table (fields with type and coverage, links per kind); the datom table names
entities and linked values. All of it is inferred from the loaded window and
the panels say so.

Reads follow kotobase's query gate (2026-09-25), which refuses any clause with
neither the entity nor the attribute bound (`[[?e ?a ?v]]` is refused as
`:variable-attribute`). So:

- the window is `datomic.datoms` over `:eavt` with a limit (whole entities);
- each kind's whole-database count is `(count-distinct ?e)` over its most
  common attribute (a lower bound for the kind), and kinds the window did not
  reach are found through `:db/ident` and listed via `:aevt`;
- selecting a thing reads its own facts (`:eavt [id]`) and what refers to it
  (`:vaet [id]`, reference values only), naming referrers from outside the
  window;
- search matches the loaded window as you type, and "search the whole
  database" runs `lower-case` + `includes?` on each name-like attribute.

The host must let `datomic.datoms` through its gateway and give it the same
read-only authorization as `datomic.q`.

Selecting a thing adds it and its neighbours to an exploration canvas;
selecting one already there expands it in place. A small force layout places
nodes, a dragged node stays pinned, labels keep their on-screen size at any
zoom. Billing, readiness claims,
account headers, telemetry, and login policy are not library defaults.
Include the DADS stylesheet, token bridge and exported `page-css`.

## Locale (JA / EN)

`view` accepts `:locale` — `:ja` or `:en`, default `:ja` when absent (a host
that passes no `:locale` renders exactly what it rendered before). It picks the
copy of every user-visible string in the rendered workbench: nav labels, section
titles, buttons, form labels, placeholders, support text, empty states and
footnotes. The exported `panels` `:label` values stay Japanese for
compatibility; `view` swaps the nav label per locale. The locked auth-gate
default copy stays host-owned.

Runtime strings (status messages, dynamic button text, empty rows) localize in
the browser: `mount` reads `root.getAttribute('lang') ||
document.documentElement.lang` once — `ja` when absent or unknown — and picks
each string through a small `t(ja,en)` helper. The host therefore sets
`lang="ja"` or `lang="en"` on the wrapper element the workbench mounts into.

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



## Auth-gate empty-state (graph.kotoba.cloud contract)

LOCKED DOM + mount contract for unauthorized vs empty tenant views. States are
ONLY `not-signed-in` and `signed-in-empty` (no `loading`). Host owns session
and JA/EN copy; library defaults are placeholders.

### DOM

- Root: `[data-auth-gate][data-panel=<id>][data-state=not-signed-in|signed-in-empty]`
- Primary: `a[data-auth-gate-primary]` (sign-in) or `button|a[data-auth-gate-primary]` (host action)
- Optional secondary: `[data-auth-gate-secondary]`
- Existing empty ids stay: `#schema-view-empty`, `#table-view-empty`, `#graph-view-empty`, `#q-out`
- Gate is a sibling/region inside the panel — explore controls are not wiped

Panels that carry a gate: `overview` | `graph` | `ontology` | `datoms` | `query`.

### Overview metrics

When `data-state=not-signed-in`, the metric region (`[data-overview-metrics]`:
プラン / Pins / Storage / Pin health) and header tenant line (`.kb-identity`)
are `hidden` / `aria-hidden` so `data-field` tiles do not present bare "—" as
live values. `signed-in-empty` may show metrics with honest unknowns — never
invented zeros.

### Mount

```javascript
const console = window.cloudKotobaGraph.mount(root, {
  request(path, options) { return applicationTransport(path, options); },
  signInHref: 'https://auth.kotoba.cloud/sign-in?return_to=https://graph.kotoba.cloud/',
  // optional: 'not-signed-in' | 'signed-in-empty' | null (hide gates)
  authGateState: 'not-signed-in',
  authGateStateAfterLoad: null,
  hashPrefix: 'knowledge/',
  blockHref(cid) { return existingBlockURL(cid); },
  signOut() { return revokeApplicationSession(); }
});
console.setAuthGateState('signed-in-empty'); // or null to hide
```

Defaults: `signInHref` → auth.kotoba.cloud return_to graph.kotoba.cloud.
`:not-signed-in` primary MUST use that href. `:signed-in-empty` primary is a
host action only — never a sign-in URL.

Render helper: `cloud-kotoba-dds.graph-workbench/auth-gate`.
Panel roots for SPA routing are `[data-panel][id]` so nested
`[data-auth-gate][data-panel]` is not a route target.

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
