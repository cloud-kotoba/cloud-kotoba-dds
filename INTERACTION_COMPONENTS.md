# Interaction components 0.1.0 — tokens / menu / status

product ごとの `interaction.js` が手で書いていた振る舞いを、**design token → component →
runtime** の 3 層で共通化する（owner 指示 2026-09-16「interaction は共通コンポーネント化して,
cloud-kotoba-dds, design-token, component に落とし込んでいって」）。第 1 波はこの 3 つ。

```
cloud-kotoba-dds.tokens   --ck-* design token（surface 4 種の dark lift、text、radius、layer、motion）
cloud-kotoba-dds.menu     context / floating menu（hiccup + runtime cloudKotobaMenu）
cloud-kotoba-dds.status   role=status の 1 行（hiccup + runtime cloudKotobaStatus）
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

## 実測（2026-09-16、bots-workspace 見本、headless Chromium）

操作 button → rendered menu が開き最初の item に focus / ↓ で次 / Escape で閉じて 操作 に focus
が戻る / ピン留め（`data-action`）→ runtime が dispatch し menu が閉じ status が `ok` で
「ピン留めしました: …」 / 行の右クリック → data から menu を組み viewport 内に置く（item 2、
separator 1）/ danger item → status `warn`、menu は DOM から消える / 外側 click で閉じる。
console error 0。audit 100.0（`:fixed-anchor` が `.ck-menu` の anchor 不足を一度指摘 → CSS に
`left:0;top:0` を持たせて解消）。

Apache-2.0。
