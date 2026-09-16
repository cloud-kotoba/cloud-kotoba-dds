> 2026-09-16: the account menu is a `jp-go-dds.behavior` menu (`data-behavior=menu` on the
> root, the chip is `[data-menu-opener]`, the menu `[data-menu-popup][data-chrome=float]`,
> items `role=menuitem`). Open / close / Escape-to-chip / outside click / arrows / typeahead
> are the runtime's — ship `jp-go-dds.behavior/script` (`theme/scripts` "behavior.js") next to
> `shell/script`, and `behavior/css` (the float layer) before `shell/css`. `shell/script` only
> fills and reveals the chip. Measured: `node test/shell.mjs` at 390 / 1440.

# Shell components (0.1.0)

`cloud-kotoba-dds.shell` — the app-shell chrome pattern from [design.md](design.md)
(shell / account-entry / navigation) as a reusable component: the console **top bar
that stays put** and the **account entry whose menu floats**. First host:
kotoba.cloud (every sidebar document).

Owner observation 2026-09-15 on kotoba.cloud: the top bar scrolled away with the
content, and the account menu at the sidebar's foot opened *in flow* — the foot grew
by the menu's height ("just expands"). Both are chrome that stopped being chrome.

## The two layers are measured, not trusted

The top bar carries `data-chrome="top"`, the menu `data-chrome="float"`. These are
the markers of shinkansen.audit's `:chrome-layers` axis: a document that emits them
must also carry a `position:sticky|fixed` + `top` rule addressed to `[data-chrome=top]`
and a `position:absolute|fixed` + `z-index` rule addressed to `[data-chrome=float]`,
or it scores 0 on that axis. `shell/css` carries both rules; app CSS may restyle
colors and spacing but never re-derive the layers.

## API

```clojure
(require '[cloud-kotoba-dds.shell :as shell])

shell/css        ; token-contract CSS — load after jp-go-dds tokens/bridge-css
shell/script     ; the browser runtime, ONE JS string the host ships as its own
                 ; file (script-src 'self' hosts cannot inline it)

(shell/topbar {:section (shell/section-label "MAIN" "Docs")
               :actions [credit-chip docs-link setup-chip language-switch theme-toggle]})

(shell/account-entry {:id "kc-session-nav-side" :variant :rail
                      :sign-in {:href "https://auth.kotoba.cloud/sign-in" :label "Sign in"}
                      :menu-label "Account menu"
                      :items [{:href "/account" :label "Account"}
                              {:href "/billing/" :label "Billing"}
                              {:id "kc-session-signout" :action "sign-out" :label "Sign out"}]})
```

`account-entry` emits **both** states: the sign-in control (visible) and the session
chip + floating menu (`hidden`). The document therefore carries the menu's layer rule
before any session is known, and the host only fills and reveals — no chrome markup is
built in the browser:

```js
cloudKotobaShell.hydrateSession(document.getElementById('kc-session-nav-side'),
                                {name: 'kotoba-f342c', workspace: 'Personal'});
```

`hydrateSession` writes `@name` / workspace / the avatar initial, hides the sign-in
control, reveals the `<details>`, and wires the menu: **Escape** closes it and returns
focus to the chip, a **click outside** closes it. What sign-out does stays the host's
(listen on the button by its id).

`:variant :rail` opens the menu **upward** from the chip at the rail's foot on the rail
band (`shell/rail-min-width`, 64rem) and **downward** under the chip on the compact
band where the rail is a chip row. The rail's own geometry (fixed column, chip row) is
app CSS — see [examples/shell.cljk](examples/shell.cljk).

## Verification

`examples/shell.html` is generated from `examples/shell.cljk` (kbb, SCI backend, the
`:example` classpath). `node test/shell.mjs` drives it in a real browser at 390 and
1440: after scrolling 2000px the bar's top edge is still at the top; opening the menu
changes nothing in flow (the foot's height, the chip's and the last item's position are
identical before/after) and the menu is `position:absolute`, `z-index ≥ 40`, inside
the viewport and over the rail; Escape and click-outside close it; sign-out reaches
the host. Shown to fall on a copy with the menu `position:static` ("opening the menu
changed the rail in flow") and on a copy with the bar `position:static` ("top bar
stayed put … top: -1948").
