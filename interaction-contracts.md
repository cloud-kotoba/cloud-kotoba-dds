# cloud-kotoba-dds 0.2 — 操作と適応の共通契約

この版は共通設計と操作できる見本まで。製品版ライブラリの登録、既存アプリへの適用は未実施。機械可読の対応表は contracts.edn、実際の見本は source/ と index.html。

## 言語

UI 言語は日本語／英語。既存 jp-go-dds の language-selector と挙動を再利用。既定は日本語、URL の明示 lang、保存された本人の選択、既定の順。選択しても document を移動せず、下書き・表示中の view・原文・回答言語を保持する。選択はこの見本の origin に保存する。

言語名は日本語／English の自称表記。document の lang、操作ラベル、placeholder、主要ナビ、動的な実行状態を更新する。見本の説明文・原文で未翻訳のものは lang=ja を付け、画面上で原文を保持していると知らせる。完全な英訳版カタログではない。

回答言語は別設定。UI を英語にしてもサンプル回答は指定した言語を使う。固定 JSON と CID は変更しない。翻訳されたコンテンツを保存する場合は新しい内容として別 CID にし、原文との関係を持つ。

将来の必須項目：BCP47 locale negotiation、RTL、地域別書式、複数形、長い翻訳、翻訳カタログのキー欠落検査。今回 RTL が使えるとは主張しない。

## アカウントとシート

デスクトップの rail、狭い画面のヘッダー、部品カタログは同じ account-entry を生成する。アイコンだけになってもアクセシブル名を残す。すべての view から上部の「言語・設定」でも到達できる。

設定は native dialog の modal。狭い画面では bottom sheet、大きい画面では中央の dialog。開いたときは「閉じる」に focus、背景は操作不可、閉じたら起点に戻す。閉じ方はボタンと Escape。外側タップでは閉じない。ドラッグして閉じる操作は必須にしない。

言語メニューが開いているときは最初の Escape でメニューを閉じ、次の Escape で設定を閉じる。モデル詳細は非 modal disclosure。Escape と外側クリックで閉じる。スクロールはネイティブを保ち、ポインター移動を独自に捕捉しない。

## 入力欄と状態

Enter は改行。⌘/Ctrl+Enter はサンプル実行。composition 中は送信しない。空の入力は inline error と入力欄への focus。実行中は二重実行を防ぎ、入力編集は続けられる。完了時は実行開始後に変更された下書きを消さない。

状態は idle / invalid / offline / running / complete。role=status と polite/atomic を使い、文字を逐次読み上げさせず意味のある遷移を通知する。完了は今回ローカルのサンプル処理の完了のみであり、生成・保存・通信の receipt ではない。

接続切れの再現を有効にすると、理由と次の操作、再試行を表示する。下書きを保持し、設定を戻すと同じ内容で再試行できる。実際のネットワークには接続しない。

下書きの永続保存は初期 off。本人が有効にした場合のみ、この origin の専用 key に保存。無効化で保存分を削除し、編集中の内容は維持。保存領域が拒否された場合は失敗を表示。音も初期 off、今回の有効化はページを開いている間だけ。音が再生できなくても操作成功を妨げない。

## スマートフォンとタッチ

主作業と入力を優先し、account を隠して消さない。safe-area を sheet と下部 nav に適用。visualViewport の高さを設定 sheet と入力時の枠へ渡す。入力中は下部 nav を隠し、入力領域を確保する。これはキーボード対応の機構であり、実機での成立の証明ではない。

標準操作領域は44 CSS px相当、coarse pointer では主要操作の高さ48 CSS px相当。長押し・hover・swipe・drag だけでしか使えない操作は提供しない。ブラウザの zoom、文字選択、戻る gesture、通常スクロールを維持する。

## アクセシビリティとデザイン運用

全対話部品に accessible name、focus-visible、keyboard の経路を持つ。選択中の navigation は aria-current=page。view 移動は文書を再読込せず、対象 view に focus を移す。view 内の DOM を破棄しないため draft と scroll の状態が残る。

OS と本人の reduced-motion の両方を尊重。modal、sample reply、押下の動きを抑止。色の変更だけに状態を依存させない。

contracts.edn はこの版の仕様 inventory。まだ全項目から実装を生成する正本ではない。製品化する際は token と state machine から catalog/test を生成し、アプリ固有の上書きを検知する gate を加える。

## 残っている実装・検証

- iOS Safari／Android Chrome の実キーボード、IME、回転、片手操作。
- VoiceOver／TalkBack、200%文字拡大、強制配色、全色のコントラスト。
- RTL、全説明の翻訳、localized date/number、翻訳の原文関係。
- async combobox、toast queue、context menu、並べ替えの代替操作、undo、未保存競合。
- production router、永続 conversation、content resolver、認証・認可との adapter。
- 実装と仕様の自動同期、複数製品で同一 API を使った互換性検査。
