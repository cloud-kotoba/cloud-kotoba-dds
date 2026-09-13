# Bot component 0.1.0

Bot ごとの顔・色・形と、作業状態の動きを分離した専用モジュールです。ブラウザ用の依存なし SVG renderer、DADS トークンを使う CSS、Clojure/Kotoba の mount point を提供します。認証・推論・保存・通信は持ちません。

## 組み込み

DADS の CSS を読み込んだ後に `resources/cloud_kotoba_dds/bot.css` と `bot.js` を読み込みます。Clojure の依存では `resources` が classpath に含まれます。

```js
const options = {
  id: 'stable-bot-id',
  avatar: {color: 'blue', glyph: 'circle'},
  status: 'idle'
};
const face = cloudKotobaBot.create(options);
container.append(face);
cloudKotobaBot.update(face, {...options, status: 'working'});
```

`id` は永続 ID を使います。名前や作業状態から生成しないでください。保存済みの色と形は維持し、目・口・模様・間隔を ID から決定します。顔の組み合わせは有限で、一意性や認証を保証するものではありません。ID は内部で整数に変換され、ネットワークには送られません。

`create(options, document?)` は span を作成し、`update(element, options)` は既存要素を更新します。更新時は同じ ID・avatar を渡してください。状態だけの更新では SVG ノードを維持します。`profile(options)` は描画用の決定的な値を返す純粋関数です。

色: `clay red orange amber green teal blue violet pink slate`。形: `circle bean block wide wedge cloud wave drop`。省略・無効値は ID から補完します。`avatar.variant` は ID 未指定時の互換用の入力で、新規利用では ID を必須として扱ってください。

## 状態とアクセシビリティ

| status | 表示 |
| --- | --- |
| idle | ゆっくりした呼吸・瞬き |
| working | 小さな左右の動き・集中した眉 |
| waiting-approval / waiting-connection | 注意印。両者の違いは隣の状態テキストで伝える |
| blocked | 動かない姿勢と眉 |
| disabled | 閉じた目・停止 |
| unknown / 未指定 | 動きなし |

実際の状態はホストから渡します。動きは処理成功や進捗を意味しません。隣に Bot 名と状態のテキストを表示してください。通常は装飾として `aria-hidden=true`。単独で意味を伝えるときは `label: 'Engineer: 作業中'` を渡すと `role=img` と accessible name が付きます。ホストが状態テキストと label を更新します。

`motion: 'off'` は明示的な停止。`prefers-reduced-motion: reduce` では常にすべての動きを止めます。SVG はフォーカスを取りません。ホストのボタンや会話リストが操作とフォーカスを所有します。CSS アニメーションのみで、タイマーや常駐ループはありません。

サイズはホストで `.ck-bot {width:3.75rem;height:3.75rem}` のように指定します。コンポーネント自体は画面幅による切り替えを持ちません。テーマは Bot の色・形を上書きせず、周囲の UI を変えてください。

## Clojure/Kotoba mount

```clojure
(require '[cloud-kotoba-dds.bot :as bot])
(bot/avatar {:id "stable-bot-id" :color :blue :glyph :circle
             :status :idle :motion :auto})
```

返り値は Hiccup の mount point です。HTML を挿入した後に `cloudKotobaBot.mountAll()` を呼びます。JavaScript を読み込むまでは顔を描画しないので、Bot 名・状態のテキストはホストが別途出力してください。

## 検証と見本

- [動く見本](examples/bots.html): 架空の Bot、同じ色・形で異なる ID、7 状態、動きの停止。
- `node test/bot-component.mjs`: ID の安定性、状態の独立性、近い ID の分散、DOM 維持、アクセシビリティ切替。
- `python3 source/bots-example.py`: 同梱 DADS トークンから見本を再生成。
- 320 / 390 / 768 / 1440 CSS px で横はみ出しなし、状態変更・手動停止・reduced motion をブラウザで確認。

Apache-2.0。見本の DADS トークンのライセンスは `assets/LICENSE-DADS` と `assets/LICENSE-jp-go-dds` を参照してください。
