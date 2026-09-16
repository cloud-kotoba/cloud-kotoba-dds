# Switch components 0.2.0 — theme（light / dark / system、λ toggle）と言語

どの product も持つ 2 つの切り替えを、shinkansen の契約（`shinkansen.theme` /
`shinkansen.locale`、`shinkansen.interaction` の runtime）の上の共通 component にしたもの
（owner 指示 2026-09-16「言語切り替え, dark, light, system theme switcher も統合」）。

```clojure
(require '[cloud-kotoba-dds.switch :as switch]
         '[shinkansen.theme :as theme])

;; <head>: 保存された選択を paint 前に当てる（これが無いと遷移のたびに白く光る）
[:script theme/head-script]

;; 任意の場所（topbar の actions、設定 sheet …）
(switch/theme-switch {:id "theme"})                            ; ライト / ダーク / システム
(switch/locale-switch {:id "lang" :current "ja"
                       :locales [{:locale "ja" :label "日本語" :href "/"}
                                 {:locale "en" :label "English" :href "/"}]})

;; </body> の前: runtime → component の script
[:script shinkansen.interaction/runtime]
[:script switch/script]
```

CSS は `switch/css`（`--hig-*` token のみ、colour literal 0、test が数える）。dark の描画は
`jp-go-dds.page` の `:dark? true`（= `jp-go-dds.dark/dark-css`）が担う。

## theme

- 3 状態の radiogroup。各 option は `data-action="theme/set"` + `{mode}` を名乗り、**runtime が
  応える**（component 自身は storage も属性も触らない）。
- 状態は `<html data-theme="light|dark">`、`system` は**属性を外す**（CSS の media block が OS に
  従い、OS の変更にも追従する）。storage key は `kotoba-theme`（jp-go-dds.theme-toggle と同じ）。
- `switch/script` は `shinkansen.hydrate('theme-switch')` で pressed 状態を runtime の
  `theme.onChange` から描く。server は `system` を描き、runtime が保存値で塗り直す。

## lambda-toggle（0.2.0）

```clojure
(switch/lambda-toggle {:label "ダークモード"})   ; id は kot-theme（既定）、hidden で描く
;; css: switch/lambda-css（= jp-go-dds.theme-toggle/css）、script: switch/script
```
kotoba-lang.org の λ yin-yang（`jp-go-dds.theme-toggle/control`）を shinkansen の theme 契約に載せた
2 状態 switch（owner 指示 2026-09-16「テーマ切り替えは kotoba-lang.org などで使っている lisp toggle を
使って」）。`aria-checked` は effective が dark か、click は `shinkansen.theme.set` で反対側を明示、
`data-mode` に stored choice。`hidden` で出荷し runtime が現す（JS 無しの死んだ control を置かない）。
system に戻す UI は無い —— 要る host は `theme-switch` を使う。

## locale

- `a[hreflang][lang]` の並び（audit の `:locale-path-links` が「明示的な言語切り替え」と認め、
  crawler には alternates として読める）。各 link は `data-action="locale/set"` + `{locale}`。
- runtime が negotiation cookie（`shinkansen.locale/defaults` から導出、Secure は https のみ）を
  書き、link の `href` へ移動する（`#` なら reload）。document の再 negotiate は host / edge。

## 実測（2026-09-16、headless Chromium、bots-workspace 見本）

| 操作 | 結果 |
|---|---|
| 初期（保存なし、OS light） | `data-theme` 無し、`system` が checked、地は白 |
| ダーク | `data-theme=dark`、storage `dark`、地 `#1a1a1a`；reload 後も同じ |
| システム | 属性・storage とも消える；OS を dark に切り替えると地が追従 |
| English | cookie `shinkansen_locale=en` が書かれ `?lang=en` へ移動（http origin。`file:` では cookie は書けない） |

audit: overall 100.0（skip link と `<main>` を見本に足した）。`node`/browser の console error 0。

Apache-2.0。
