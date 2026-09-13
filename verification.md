# 見本の検証結果

## 0.2 — 2026-09-13 更新

以下は0.2の確認結果。後段の0.1の制限のうち、任意のdraft保存・dialog・操作scriptについてはこの節で更新する。

- 日本語→English の UI 切替で入力済みdraftを保持。原文と固定CIDは不変。
- 保存を明示的に有効化したdraftとUI言語を、ブラウザ再読込後に復元。
- 模擬接続切れではdraftを保持し、Retryを表示。設定を戻してRetryすると running→complete とサンプル応答を確認。
- 空入力で aria-invalid=true、inline status、入力欄へのfocusを確認。
- 320/360/390/768/1280 CSS pxで document.scrollWidth <= innerWidth。英語表示でもページ全体の横はみ出しなし。
- 390pxで account-entry に名前があり、設定dialogは幅390・左端0・画面下端に配置。modal=true、初期focus=Close。
- 言語popupを開いてEscapeするとpopupだけ閉じる。次のEscapeでdialogを閉じ、元のaccount-entryにfocus復帰。
- hash view切替とbrowser backでdraftを保持。
- モバイルでtextareaから実行ボタンへのfocus移動に伴うレイアウト変化を修正。空入力案内と実行開始を再検証。
- 開発中の初期化エラー2件を修正。その後の検証で新規browser errorなし。
- 検証用の保存draftは設定の削除操作で削除し、日本語・保存off・音offに戻した。

IMEのcomposition抑止、実行中の新規編集保持、storage拒否、音声再生拒否への処理は実装済みだが、このブラウザ操作では全条件を自動再現していない。実iOS/Android keyboard、VoiceOver/TalkBack、RTL、全説明の翻訳、全色contrastは未認定。製品への適用は未実施。

## 0.1 の確認記録

確認対象は同梱の index.html。製品への適用完了を意味しません。

- jp-go-dds の page/core/tokens と CSS を実際に使用して生成。単一 HTML、外部 CDN なし。
- ブラウザで4つの view の内容を確認。
- メッセージ欄にテスト文を入力し、リンク画面へ移動、ブラウザの戻るで下書きが保持されることを確認。終了時にテスト文は消去。
- 390 CSS px で document scrollWidth = 390、見本の shell 幅358。横方向のページはみ出しなし。
- 1280 CSS px で scrollWidth = 1280。shell 幅1158、一覧220＋主作業936の2列。
- 開閉の出現 animation は 0.18s。動きを抑える設定で animation-name = none。
- dark の本文色は rgb(242,242,242)、背景 rgb(26,26,26)。全コントラストの認証ではない。
- 完了音は mono PCM WAV、44.1kHz、220ms。音声ファイルと手動再生 controls を確認。実際のスピーカーの出音・快適性は未評価。
- CIDv1/raw/SHA-256 の計算を、生成処理とは別の Python hashlib/base32 で検算。一致。
- design-quality audit は適用された10軸で100/100、gate pass。input-zoom と contrast はこの実行の採点対象外。自動スコアは実機検証を代替しない。

未検証／未実装：実スマートフォンの soft keyboard、screen reader、200%文字拡大、全色の contrast、ルート変更時の製品用 focus 管理、reload後の draft 永続化、音の event bus、名前解決、ネットワークからの内容取得、ブラウザ内 CID 検証、ログイン、送信、公開。

生成時にローカル html/->html と text/join の引数互換性の不一致を観測し、見本の generator 内で同じ html/render-node の結果を明示的に連結した。既存のリポジトリは変更していない。
