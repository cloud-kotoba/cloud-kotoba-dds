# Bots workspace pattern 0.1.0

Cloud Itonami の `#/bots` 画面（角丸の会話一覧 + Bot の面 + 送信欄。owner が
「grok bots 的な詳細なレイアウト」と呼んだ形）を、共通の Hiccup component と
1 本の token-contract stylesheet として切り出したものです。認証・推論・保存・
routing・Bot の事実（名前・状態・日付・件数）はすべて host が持ちます。

```
ck-bots
├─ rail      search · 日付 group（sticky label）· Bot 行 · launcher
└─ main      titlebar（参照 chip · avatar · 名前/状態 · 操作 · ＋ 新しい Bot）
             disclosure（この Bot のプロフィール・学習）
             feed（自動確認の結果 card · note · bubble）
             composer（prompt · 送信 · key hint）
```

## 組み込み

```clojure
(require '[cloud-kotoba-dds.bots :as bots]
         '[cloud-kotoba-dds.bot :as bot]        ; 顔の mount（BOT_COMPONENTS.md）
         '[cloud-kotoba-dds.styles :as styles]) ; styles/bots-css

(bots/workspace {:aria-label "Bots" :id "bots"}
  (bots/rail {:aria-label "Bot 一覧"}
    (bots/rail-search {:id "q" :placeholder "Bot を検索" :aria-label "Bot を検索"})
    (bots/rail-list {}
      (bots/rail-group {} "過去7日間"
        (bots/rail-item {:avatar (bot/avatar {:id "bot-1" :color :violet :glyph :bean :status :blocked})
                         :name "itonami 旅 · Product Manager"
                         :meta "error · 次回 9/9 16:48" :time "9/11"
                         :unread? true :current? true
                         :attrs {:data-bot-id "bot-1"}})))
    (bots/rail-launcher {}
      (bots/launcher-link {:href "#apps" :label "App" :mark "▦"})))
  (bots/main {}
    (bots/titlebar {:refs (bots/chip {:label "参照 0" :as :button})
                    :avatar (bot/avatar {...}) :name "…" :status "error · 次回 9/9 16:48"
                    :actions [(bots/rail-toggle {:aria-controls "bots"} "一覧")
                              (bots/action {:label "操作"})
                              (bots/action {:label "＋ 新しい Bot" :primary? true})]})
    (bots/disclosure {} "この Bot のプロフィール・学習" (bots/bubble {:role :bot} "…"))
    (bots/feed {:aria-label "この Bot の記録"}
      (bots/feed-note {} [:span "自動確認の内部指示"])
      (bots/result-card {:title "自動確認の結果" :tag "失敗 ×21" :tag-state :error
                         :summary "モデルへの接続に失敗しました（HTTP 503）。"
                         :more [:a {:href "#full"} "全文を見る"]}))
    (bots/composer {:id "composer"}
      (bots/prompt {:id "prompt" :placeholder "… に頼む" :aria-label "依頼"})
      (bots/send {} "送信")
      (bots/composer-hint {} "Enter で改行 · ⌘ / Ctrl + Enter で送信"))))
```

CSS は `jp-go-dds.tokens/bridge-css` → `bot.css` → `styles/bots-css` の順に読みます。
全要素に `data-ck-bots="<part>"` の hook が付くので、host の script は class ではなく
hook を狙えます（class は styling contract、hook は behaviour contract）。

## テーマ — dark は描かない、導く

stylesheet は `--hig-*` / DADS semantic token だけで書かれています（colour literal
0 件。`test/bots_workspace_test.cljk` が数えます）。したがって `jp-go-dds.dark`
（OS の `prefers-color-scheme`、`[data-theme]`）と、primitive を反転する host の
appearance 層に**無改造で**追従します。

反転だけでは ground と raised が同じ grey に落ちて平らに見えるので、4 つの surface
token（`--ck-bots-ground / raised / hover / border`）だけは `light-dark()` で dark 側を
持ち上げています。値は `jp-go-dds.dark` が退避する `--dds-light-*` snapshot を
`color-mix` した**導出値**で、新しい色ではありません。host は `.ck-bots` 上でこの
4 つを再定義すれば pattern 全体の色調を変えられます — 個別 rule の上書きは不要です。

⚠ dark を持たない host（`jp-go-dds.page` の `:dark? false`、snapshot 無し）では
`light-dark()` の dark 側が解決しないので、その host は light のまま描かれます。
それは fail-closed であって欠陥ではありません。

## 幅の帯

- `≥ 48rem`: 2 列（rail 19rem + main）。
- `< 48rem`: main だけ。`rail-toggle` が `.show-rail` を root に付けると rail が
  main の代わりに表示されます（sheet ではなく置き換え — 1 画面 1 task）。
- `≤ 30rem`: 行と avatar を一段小さく、titlebar の actions は折り返し。

## 検証と見本

```
kbb --backend sci --classpath src:test:../jp-go-digital-design-system/src:../text/src:../css/src:../html/src test/bots_workspace_test.cljk
JP_GO_DDS_CSS=../jp-go-digital-design-system/resources/jp_go_dds/dds.css \
  kbb --backend sci --classpath src:resources:../jp-go-digital-design-system/src:../html/src:../css/src:../text/src:../shinkansen/src examples/bots_workspace.cljk
```

見本 [examples/bots-workspace.html](examples/bots-workspace.html) は `jp-go-dds.page`
（`:dark? true` + λ theme toggle）の上に fixture の Bot を並べた 1 文書で、生成器が
そのまま **shinkansen の document judge**（`shinkansen.audit` 13 軸 +
`shinkansen.viewport`）で採点し、floor 90 未満なら exit 1 にします。
2026-09-16 実測: **overall 100.0**、viewport ok、1440 / 390 × light / dark で横はみ出し
なし（headless Chromium）。

Apache-2.0。
