# Theme — `cloud-kotoba-dds.theme`（Kotoba アプリの既定 design token と document 既定、2026-09-16）

オーナー指示: 「app.itonami.cloud の uiux, design token を cloud-kotoba-dds のデフォルトに」
「kotoba.cloud の uiux を app.itonami.cloud の uiux token に合わせて」「shinkansen webframework を使って」。

実測（同日）: app.itonami.cloud の `--hig-*` は jp-go-dds の bridge の値（DADS の key blue
`#0017c1`・neutral・Noto Sans JP・rem-calc spacing）に解決していて、kotoba.cloud と同じ値だった。
違いは**宣言している token の数**（itonami 117 / kotoba.cloud 71）で、差の 46 個は legacy の HIG 層が
運んでいた text weight / family・display1-3・palette 6 色。bridge が全部運ぶようになった
（jp-go-dds `9fd79a8`、128 個）ので、ここでいう「既定 token」は bridge そのもの。

| 名前 | 中身 |
|---|---|
| `tokens` | `jp-go-dds.tokens/hig->dads`（128） |
| `motion` / `layers` / `breakpoints` | 同じ数字のデータ。`contracts.edn :motion`、`shinkansen.viewport/breakpoints` と一致することを `test/theme_test.cljk` が pin |
| `chrome-css` | document 既定: `box-sizing`、body は grouped background + `--hig-font-text`、focus ring は `--hig-color-tint`、form control は inherit、reduced-motion |
| `css` | skin（bridge + a11y）→ chrome → `jp-go-dds.behavior/css` → shell → switch → sheet → code → console → catalog |
| `(stylesheet dds-css)` | host が配る 1 本: DADS vendored css + dark mirror（`jp-go-dds.dark`、shinkansen の `data-theme`）+ `css` |
| `scripts` | host が配る file: `theme.js`（`<head>`、paint 前）/ `shinkansen.js`（interaction runtime）/ `behavior.js` / `shell.js` / `switch.js` |
| `(head {:base :stylesheet})` | viewport meta・`color-scheme`・theme.js・stylesheet link・defer script |

theme は light / dark / system の shinkansen 契約（既定 `system`）。chat / bots / graph の
workspace CSS は既定に含めない（`cloud-kotoba-dds.styles`、`graph-workbench`）。

## settings sheet — `cloud-kotoba-dds.sheet`

`contracts.edn :settings-sheet` の component 化。`jp-go-dds.core/modal-dialog`（`<dialog>`、
`data-behavior=dialog`）の上に `.ck-sheet`: `--hig-breakpoint-sm` 以下は bottom sheet、上は
中央 dialog。backdrop click は何もしない。開くのは `behavior/dialog-open-attrs`。

## 採用

kotoba.cloud（`kotoba-lang/app-kotoba-cloud`）が最初の host。
