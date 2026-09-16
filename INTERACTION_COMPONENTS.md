# Interaction components 0.2.0 — tokens / menu / status / composer / thread

product ごとの `interaction.js` が手で書いていた振る舞いを、**design token → component →
runtime** の 3 層で共通化する（owner 指示 2026-09-16「interaction は共通コンポーネント化して,
cloud-kotoba-dds, design-token, component に落とし込んでいって」）。第 1 波はこの 3 つ。

```
cloud-kotoba-dds.tokens   --ck-* design token（surface 4 種の dark lift、text、radius、layer、motion）
cloud-kotoba-dds.menu     context / floating menu（hiccup + runtime cloudKotobaMenu）
cloud-kotoba-dds.status   role=status の 1 行（hiccup + runtime cloudKotobaStatus）
cloud-kotoba-dds.composer 書く場所の振る舞い（bots markup + runtime cloudKotobaComposer）  ← 0.2.0
cloud-kotoba-dds.thread   届く答えの振る舞い（bots feed/bubble + runtime cloudKotobaThread） ← 0.2.0
```

読み込み順: jp-go-dds css → `jp-go-dds.tokens/bridge-css` → **`tokens/css`** → 各 component css。
script: `shinkansen.interaction/runtime` → `menu/script` `status/script` → host。

## tokens

| token | 意味 |
|---|---|
| `--ck-surface-ground / -raised / -hover / -border` | 面。light は DADS semantic、dark は `light-dark()` + `color-mix` で snapshot から**導出**（bots pattern から移設） |
| `--ck-text / --ck-text-muted / --ck-accent / --ck-danger / --ck-success / --ck-warning` | 文字・強調 |
| `--ck-radius-sm / -md / -lg / -pill` | 角丸 |
| `--ck-layer-top / --ck-layer-float` | chrome の層（`:chrome-layers`） |
| `--ck-shadow-float` | floating 面の影（border 色から導出） |
| `--ck-surface-accent` | 本人の発話の面（light は key-50、dark は tint を lifted grey に mix） |
| `--ck-composer-max-height` | composer の textarea が伸びる上限（12rem = itonami の 192px） |
| `--ck-motion` | 遷移時間。`prefers-reduced-motion` で 0s |

component の stylesheet は `--ck-*` と `--hig-*` だけを読む（test が数える。colour literal 0、
`light-dark(` は tokens 以外に 0）。host は `:root`（または subtree）で token を再定義して
library 全体を調律する —— component の rule は上書きしない。`--ck-bots-*` は alias として残る。

## menu

```clojure
(menu/floating {:id "ops-menu" :label "Bot の操作"
                :items [{:label "ピン留め" :icon-path "M12 17v5 …" :action :bots/pin :params {:id "b"}}
                        :separator
                        {:label "1個のBotを削除" :action :bots/delete :params {:id "b"} :danger? true}]})
```
```js
shinkansen.on('bots/ops', (p, el) => cloudKotobaMenu.show(document.getElementById('ops-menu'), {anchor: el, opener: el}));
row.addEventListener('contextmenu', ev => { ev.preventDefault();
  cloudKotobaMenu.open({label: 'Bot の操作', at: {x: ev.clientX, y: ev.clientY}, opener: row,
    items: [{label: 'ピン留め', icon: 'M12 17v5 …', onSelect: () => pin(id)}, 'separator',
            {label: '削除', danger: true, onSelect: () => remove(id)}]}); });
```
`role=menu / menuitem / separator`、`data-chrome=float`、viewport に clamp、↑↓ Home End、Escape、
外側 pointerdown、scroll で閉じ、opener に focus を返す。item は `onSelect`（host の関数）か
`action`（shinkansen dispatch）。icon は 24×24 の stroke path。

## status

```clojure
(status/line {:id "status" :label "操作の結果"})   ; role=status aria-live=polite、空で描く
```
```js
cloudKotobaStatus.say(el, '保存しました。', {tone: 'ok'});          // 6 秒で消える
cloudKotobaStatus.say(el, '送信できませんでした。', {tone: 'error'}); // 残る
```
空の status は `:empty` で場所を取らない（load 時に文が入っている status は `:idle-pending` の劇場）。

## composer（0.2.0）

```clojure
(composer/form {:id "composer" :input-id "prompt" :label "依頼" :placeholder "この Bot に頼む"
                :help "Enter で改行 · ⌘ / Ctrl + Enter で送信" :maxlength 8000
                :send-attrs {:id "send"} :stop-attrs {:id "stop"}})
;; = bots/composer + bots/prompt + bots/send + bots/stop + bots/composer-hint、action は bots/send / bots/stop
```
```js
const composer = cloudKotobaComposer.attach(form, {running: () => !!activeRun, busy: () => shellBusy});
shinkansen.on('bots/send', () => { const text = composer.value(); if (!text) return; composer.clear(); … composer.refresh(); });
shinkansen.on('bots/stop', () => activeRun?.abort('stop'));
```
Enter は改行、⌘/Ctrl+Enter で送信（`isComposing` / keyCode 229 の IME guard）、textarea は
`--ck-composer-max-height` まで autosize、`running()` の間 send は `data-label-more`（「追加で伝える」）
を読み stop が現れる、`busy()` の間 send は disabled、`<dialog>` の外の Escape は stop を click。
**空のときに send を disabled にしない** —— audit `:idle-disabled` が greyed control を減点する
（見本 98.8 → 100.0）。空 submit は host が無視する。label は属性なので locale 表が訳す。

## thread（0.2.0）

```clojure
(bots/feed {:id "feed"} … (thread/bubble {:role :person :followup-id "fu-1"} "追加で"))
```
```js
const person = cloudKotobaThread.bubble(feed, {role: 'person', text, followupId});
const run = cloudKotobaThread.run({feed: () => visible ? feed : null, source: (init) => fetchWithCsrf(url, init),
  init: {method: 'POST', body}, render: renderMarkdown, onFrame: (f) => { if (f.type === 'phase') showPhase(f); }});
run.promise.then(({done, messages, turn}) => …, (e) => e.name === 'AbortError' ? stopped() : failed(e));
run.abort('stop');
```
読むのは `shinkansen.streamRun`（SSE `data:` と NDJSON を 1 つの reader で。`source` に関数を渡すと
認証・CSRF retry は host のまま）。`delta` は 1 つの bubble を伸ばし（`dataset.markdown` に蓄積、
`render` で描く）、`followup-applied` は frame が名指す `[data-followup-id]` の直後に新しい bot bubble
を開き、`done` で resolve、`error` frame で reject（`error.turn`）、`abort()` は body がどう終わっても
`AbortError` で reject。phase / tool は thread の語彙ではない —— `onFrame` で host に渡るだけ。

## 実測（2026-09-16、bots-workspace 見本、headless Chromium、`test/composer_thread_browser.cljk`）

idle: send は enabled で「送信」、stop hidden / Enter で改行し submit しない / 40 行入れると textarea は
72px → 192px（= `--ck-composer-max-height`）で止まり、戻せば縮む / keyCode 229 の ⌘Enter は submit
しない / ⌘Enter で submit → prompt 空、person bubble、空の bot bubble、send は「追加で伝える」、stop
表示 / 実行中の ⌘Enter → `data-followup-id=fu-2` の person bubble / stub NDJSON 6 frame: delta ×2 で
**1 つの** bubble が伸び、`followup-applied` は fu-2 の直後に新 bubble、`done` で status `ok`
「完了しました。」、send は「送信」に戻る / 2 本目を Escape → `AbortError` → 「中止しました。」。
`SCANNED 10`、console error 0。stub の body が abort 後に静かに閉じると `done:false`（「途中で切れま
した」）に読めた → `abort()` は flag を立て onClose でも AbortError にした（その 1 回の赤が理由）。

## 実測（2026-09-16、bots-workspace 見本、headless Chromium）

操作 button → rendered menu が開き最初の item に focus / ↓ で次 / Escape で閉じて 操作 に focus
が戻る / ピン留め（`data-action`）→ runtime が dispatch し menu が閉じ status が `ok` で
「ピン留めしました: …」 / 行の右クリック → data から menu を組み viewport 内に置く（item 2、
separator 1）/ danger item → status `warn`、menu は DOM から消える / 外側 click で閉じる。
console error 0。audit 100.0（`:fixed-anchor` が `.ck-menu` の anchor 不足を一度指摘 → CSS に
`left:0;top:0` を持たせて解消）。

Apache-2.0。
