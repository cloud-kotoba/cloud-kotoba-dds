# cloud-kotoba-dds

Kotobaのアプリ向け共通デザイン・操作ルール。`jp-go-dds`を土台に、スマートフォンと会話型アプリで主作業を優先する構成を定義します。

## 設計ルール

- 主作業と次の操作を優先し、関連する操作を一か所にまとめる。
- 同じ情報を重複表示しない。空の会話を履歴に並べない。
- 利用量・料金の内訳・モデル詳細・管理操作は、設定や詳細から開く。
- 同意、支払い前の料金、実行状態、エラーと復旧操作は省略しない。
- スマートフォンの入力領域、タッチ領域、フォーカス、下書きを守る。

詳しくは [デザインルール](design-rules.md)、[基礎設計](design.md)、[操作契約](interaction-contracts.md)、[機械可読の契約](contracts.edn) を参照してください。

## 動く見本

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

ブラウザで http://127.0.0.1:8766/ を開きます。外部CDNは不要です。`index.html`、`assets/`、`source/`を含む静的な見本です。

画面切替、言語切替、設定シート、下書き保存、エラー・再試行、モデル詳細を試せます。会話は固定データであり、生成・認証・課金・公開は行いません。

## 共通の生成UI

**0.3.0-alpha** の再利用可能な会話コンポーネントを追加しました。会話一覧・メッセージ・入力欄・モデル選択・共通スタイルとDOM描画を提供し、Murakumoで利用しています。[組み込み方とAPI](CHAT_COMPONENTS.md)、[最小の組み込み例](examples/chat.html)を参照してください。認証・生成API・料金・履歴保存は利用側から接続します。

## Shell の chrome（top bar・account entry）

**Shell component 0.1.0**（`cloud-kotoba-dds.shell`）は、スクロールしても動かない top bar と、
rail の足元から**浮く**（rail を押し広げない）account menu を提供します。両方が
shinkansen.audit の `:chrome-layers` marker（`data-chrome=top` / `float`）を持ち、
層の rule は測られます。[API と組み込み方](SHELL_COMPONENTS.md)、[動く見本](examples/shell.html)、
検証は `node test/shell.mjs`。kotoba.cloud の console が最初の host です。

## Bot の顔と動き

専用の **Bot component 0.1.0** は、ID による顔の特徴、保存済みの色と形、状態ごとの動き、動きを減らす設定への対応を提供します。[API と組み込み方](BOT_COMPONENTS.md)、[動く見本](examples/bots.html)を参照してください。

## 既存の見本の範囲

バージョンは **0.2.0-study**。共通設計・操作契約・見本のリポジトリです。直感性を優先する表示ルールはMurakumoで適用されていますが、この見本全体は配布可能な製品用コンポーネントライブラリではありません。router、認証、永続会話、生成・課金の各adapterは今後の実装範囲です。

`source/design-preview.cljs`がHTML生成、`source/preview.css`と`source/interaction.css`がスタイル、`source/interaction.cljs`が見本の操作を所有します。生成にはjp-go-dds、html、css、textとkbbが必要です。generatorには出力ディレクトリとjp-go-dds checkoutの絶対パスを順に渡します。browser adapterはSquint 0.14.208とesbuild 0.28.2で`assets/interaction.js`に生成されたものを同梱しています。

[以前の見本の検証記録](verification.md)は実施時点の記録です。現在の全製品への適用・実機動作を保証するものではありません。

## ライセンス

MIT。基礎CSS・部品・同梱runtimeの帰属とライセンスは`assets/LICENSE-*`に保持しています。

## 検証

Playwright とブラウザを用意した環境で `node test/browser.mjs` を実行します。必要に応じて `PLAYWRIGHT_MODULE` にインストール先、`BROWSER_CHANNEL=chrome` を指定できます。320・390・768・1440pxの横幅、設定の開閉、Escape、下書き保持を確認します。

## 共通GraphDB管理画面（開発中）

Graph Viewer・Ontology Inspector・データム表・Queryなどの共通部品を追加しました。[APIと接続契約](GRAPH_COMPONENTS.md)、[オフラインの見本](examples/graph.html)を参照してください。実テナントでの認証・操作の検証は利用側で行います。
