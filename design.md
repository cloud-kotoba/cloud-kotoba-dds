# cloud-kotoba-dds — 共通設計案 0.2

2026-09-13 更新 · Design study · 製品への適用前

0.2 の実装と操作契約は [操作と適応の共通契約](interaction-contracts.md) を参照。以下は基礎設計。0.1 時点の実装範囲に関する記述より、0.2 の仕様と検証記録を優先する。

## 決定の範囲

jp-go-dds を土台に、Kotoba 全体のアプリ向け UI・操作・フィードバックを共有する。今回の成果物は設計と動く見本まで。既存サービス、共通ライブラリ、kotoba-uiux の正本、当時はGitHubリポジトリを変更していない。2026-09-13に本リポジトリへ移管した。以下の「標準」は提案であり、既存実装がすべて満たしているという報告ではない。

cloud-kotoba-dds は DADS のフォークでも、各製品に別の装飾を配るテーマ集でもない。DADS に不足するアプリの構成・状態・振る舞いを所有する共通層とする。名前はユーザー指定を採用し、リポジトリを作る際に配置と公開範囲を確定する。

## 現在の差が生まれた経緯

確認した実装は以下。コードの観測と、実際の配信状態を混同しない。kotoba.cloud と kotobase.net 全ページの実機監査は今回の範囲に含めていない。

|対象|確認した事実|設計への示唆|
|Cloud Itonami のアカウント表示|PR #286、コミット 528da8d が account-entry の構造と独自 CSS を追加。角丸・余白をアプリが決定し、既存アバターを再利用。現在の localhost の HTML/CSS でも確認|基本色を共有するだけでは部品の寸法と密度は揃わない|
|PR #286 の目的|デスクトップを app.itonami.cloud に寄せ、左上のアカウント、Bot 一覧と会話、Wallet、Plugins を配置。Git の名義は Jun Kawasaki。AI の実作者は未特定|外観を新たな標準とみなす前に、一覧／詳細、アカウント入口、詳細の段階的開示という目的を抽出する|
|kotoba-uiux|DADS にない app-shell、segmented control、trailing slot 付き list をアプリ CSS で補う方針。共有 router は未抽出との記述。既存・legacy 方針が同じ文書に重複|共通にしたい領域が各アプリに委譲されたまま。新しい共通層の責務を明文化する|
|app-kotoba-cloud の site.cljc|HIG bridge を使う kc-* の独自 identity、steps、command、plane スタイル|同じトークンでも構成・意味の単位は製品ごとに実装されている|
|kotobase control-plane の site_chrome.cljc|DADS 部品と独自の mobile header、details/summary によるメニュー。認証状態を明示的に受け取る|mobile navigation と identity state は再利用できる責務|
|jp-go-dds tokens.cljc|共通の HIG bridge に加えて、accent を除外して製品ブランドを維持する API が存在。一方、skill には accent 固定の記述も残る|ガイドと実装の選択肢を一本化しないと、一貫性を強制できない|
|ユーザーの Murakumo Go 画像|ヘッダー、モデル選択、工程、入力ラベル、補助操作が会話と同程度に大きい|ページ向けの情報量をそのまま積まず、作業の優先度に沿って常設表示を減らす|

画像から判断できるのはレイアウト上の競合まで。DADS 自体がスマートフォンに不適合とは断定しない。DADS を採用してもサービス固有の設計は必要と公式にも説明されている。

## 直感性を優先する表示規則（2026-09-13）

常設するのは、作業対象と次の操作に必要な情報だけ。同じ意味のタイトル・ロゴ・状態・説明を重ねない。空の会話を履歴へ並べない。通常状態では案内文や「準備できています」を出さず、入力欄と実行操作で使い方が分かる構成にする。

モデル選択は入力の近くに置き、用途と短い名称で示す。基盤モデル、利用量、料金の内訳、履歴管理は設定や詳細から開けるようにする。残高や本人情報は一つの入口へ集約する。機能の存在を伝えるためだけの常設ボタンを増やさない。

情報を減らしても、費用の確定前の提示、必要な同意、エラーと復旧操作、実行中の状態は省略しない。公開への同意は短く正確に示し、詳細へ到達できるようにする。説明を隠すことより、説明なしで次の操作が分かることを優先する。

確認は空状態・実行中・完了・失敗・ログイン状態を含める。狭い画面で入力・送信・モデル変更が一か所に収まるか、重複情報が主作業より強くなっていないかをレビューする。この規則は共通設計の更新であり、全製品への適用完了を意味しない。

## 一つの操作言語

「内容を読む・作る・つなぐ」を主役にする。主な設計パターンは adaptive application shell、一覧／詳細、詳細の段階的開示、会話＋入力欄、成果物の参照カード、状態に基づくフィードバック。特定ベンダーの UI の模倣を出発点にしない。

- 同じ意味には同じ名前・配置・キーボード操作・応答を与える。
- 色、動き、音だけで状態を伝えない。
- 操作前後で作業対象・下書き・選択を保つ。
- アプリは部品の中身と許可された構成を渡し、寸法や効果を再定義しない。
- public site は文章と探索、app は継続作業を重視する。共通部品を共有しつつ、すべてを同じ画面構成に押し込まない。

## レイヤーと所有権

|層|所有するもの|所有しないもの|
|jp-go-dds|基本パレット、文字、基礎部品、フォーカス・フォーム等の既存契約|Kotoba のルーティング、CID 解決、製品業務|
|cloud-kotoba-dds foundation|既存 bridge からの意味トークン、密度、面、効果、状態語彙|アプリごとの独自パレット|
|cloud-kotoba-dds patterns|shell、account-entry、navigation、list/detail、composer、artifact-link、status、sheet、inspector|ログインや送信を実行する権限|
|cloud-kotoba-dds behavior|focus、keyboard、motion、音の発火条件、reduced-motion、状態保持の契約|モデル呼び出し、保存成功の捏造|
|Kotoba/Kotobase adapter|既存 resolver・codec・認証から得た状態を表示形式へ変換|独自 CID codec、独自認可、別の内容ストア|
|各アプリ|作業モデル、内容、コマンド、名前、許可された構成|部品の角丸・余白・アニメーションの上書き|

実装候補は portable .cljc/.cljs、状態は既存 reagent/re-frame の契約。SSR と browser で共通の view model を使う。今回の見本は jp-go-dds.page/core/tokens で生成した単一 HTML に、ClojureScript から生成した操作スクリプトを同梱。hash による画面切替の試作であり、製品用 SPA router の実装ではない。

## トークンと見た目

色の基礎は DADS を継承。共通の accent は当面 DADS blue。ブランド差は名前・マーク・コンテンツに限定し、アクセント例外を認めるなら中央 registry で承認する。既存サービスの色は今回変更しない。

4 の倍数の余白を維持。body は 1rem、入力は少なくとも 1rem を設計目標とし、本文の読みやすさを保ったまま周辺の情報密度を調整する。標準の操作領域は 44 CSS px 相当以上。外枠、操作部品、アバターで radius の意味を分け、すべてを大きなカードにしない。文字拡大時の成立は実装の受入条件。

同じトークン名が light / dark / contrast の意味を保つ。見本の dark は中央トークンの試作であり、DADS 公式の dark theme や WCAG 適合認証ではない。コントラストは採用前に両モードで測定する。

デザイン値は一つの EDN registry を正本にし、CSS custom properties、component schema、文書、検査を生成する。見本の preview.css は設計用の初期値であり、この生成基盤は未実装。

## 単一画面と単一ページ

single-page は文書を再読込しない実装契約。single-screen は主作業・入力・重要状態が画面内で継続して扱える UX 契約。全情報を一画面に詰める意味ではない。

- compact：主ペイン一つ。詳細は戻れる別 view / sheet。主ナビゲーションは下部、補助機能は段階的に開示。
- medium：一覧＋詳細。主作業の幅が不足するなら inspector を常設しない。
- expanded：一覧＋主作業＋任意の inspector。情報量が少ないときに空のパネルを作らない。
- 端末名で分岐せず、利用可能幅、入力手段、文字倍率に応じて構成する。
- キーボード、safe area、IME、画面回転を考慮。composer を画面下の固定要素で隠さない。
- desktop のウィンドウボタンは platform shell が所有。Web の account-entry と重なる位置に置かない。

ルートは view・対象・版・公開可能な選択状態から生成し、native link と browser back/forward を成立させる。静的配信では fragment、rewrite を検証した環境だけ path。draft、秘密、capability token は URL に入れない。ルート切替時のフォーカス先、戻るときのスクロール・選択復元をルート契約に含める。

## Content addressed link web

|概念|表示と操作|
|固定版|同じ CID は同じ bytes。タイトルと版を主表示し、CID は詳細へ。取得後のハッシュ一致と署名・信頼性を別に表す|
|最新を追う名前|名前を解決した CID と解決時刻を記録。「最新」と「この版」を切り替えられる。閲覧中の内容を無通知で差し替えない|
|取得先|gateway / cache / peer は配送経路。内容の identity と認可の authority を混同しない|
|編集|固定版の変更は新しい CID。名前の更新は権限を持つ別操作。未保存 draft と固定版を区別|
|公開・共有|CID を知ることは権限ではない。非公開内容の取得、タイトル・preview の露出にも認可が必要|
|失敗|未取得、取得中、検証中、一致、不一致、認証が必要、見つからない、offline を区別。「保存済み」は耐久保存の receipt 後|

リンク view model の候補：label、target kind、content CID、name、resolved CID、resolver evidence、media type、access state、verification state。authority token は renderer に渡さない。既存の Kotoba/Kotobase codec と naming contract に接続し、DDS 独自の URI scheme を発明しない。

見本の JSON は実際に CIDv1/raw/SHA-256 を算出した fixture。作成時の検算のみ。IPFS 公開・実際の名前解決・認証・ブラウザ内の検証は未実装。

## 状態・effect・motion・sound

状態遷移を一つの共有 event vocabulary から視覚・音・必要なら haptic へ投影する。イベントの表示と実行許可を分離する。

|意味|視覚|motion の初期案|音の初期案|
|押下・選択|選択状態、focus、pressed|100ms、短い状態変化|なし|
|内容の出現|関係のある場所に表示|180ms、opacity＋小さな移動|なし|
|sheet / inspector|起点と戻り先を保つ|240ms、面の移動|なし|
|耐久保存・処理完了|簡潔な成功表示、receipt 詳細|必要なら180ms|有効化した利用者に一度だけ|
|対応が必要|理由と次の操作を本文で示す|点滅・揺れを使わない|既定なし、重大通知は別契約|
|進行中|現在の状態を簡潔に、工程は開示|無意味な無限運動を避ける|token ごとの音なし|

移動や伸縮は reduced-motion で停止し、意味が残る即時表示へ。OS 設定とアプリ内設定の厳しい方を採用。装飾音は初期 off、利用者操作で有効化し、mute・音量・重複排除・rate limit を持つ。バックグラウンド通知と会話の効果音を分ける。ブラウザの自動再生制限を回避しない。Web から OS の silent switch を読めると仮定しない。

影、blur、elevation も semantic effect token とする。浮いた面にだけ elevation を使い、通常の一覧をカードと影で覆わない。glass/blur は初期案では使わない。

見本で実装したのは出現アニメーション、reduced-motion、light/dark、手動再生の完了音。100ms/240ms は設計値であり、すべての遷移が実装済みではない。haptic と event bus は未実装。

## 初期コンポーネント契約

|部品|共有する振る舞い|
|app-shell / navigation|同じ view registry、幅に応じた配置、作業状態を保持|
|account-entry|本人と組織を区別。表示名未設定を説明できる。認証情報や権限は adapter から取得|
|composer|IME 確定で送信しない。複数行を既定、送信ショートカットの表示を統一。生成中も draft を編集可能|
|conversation / run-status|主回答が中心。長い工程は詳細へ。完了は backend の確定状態から表示|
|artifact-link / content-inspector|固定版・名前・取得先・検証・権限を別属性で表現|
|list-item / segmented-control|先頭・本文・補助・末尾の slot。選択と移動を混同しない|
|sheet / dialog / menu|開閉起点、Escape、focus の戻り先。modal のみ focus containment と背景操作抑制|
|notification / empty / error|状態、理由、回復操作。表示だけで retry や外部送信を自動実行しない|

見本の disclosure は非 modal。account、モデル情報、進行詳細、内容説明、motion を開閉可能。生成・送信・認証はしない。

## 再び分岐させない仕組み

1. component catalog は実際の共通関数から生成し、別の見本専用 markup を正本にしない。
2. 各パターンに使用条件、禁止例、状態遷移、keyboard/focus、適応幅、reduced-motion、sound event、検査 fixture を一緒に持つ。
3. app CSS の raw color・独自 radius・部品内部 selector・独自 motion/sound を検査する。業務固有の図やエディタ等の例外は対象と期限を記録。
4. 製品はパターンの profile と content を選択。例外を増やすより、二つ目の利用例で共通 API を改善。
5. design version と implementation SHA を catalog と各 app に持ち、中央更新がどの製品まで届いたか確認できるようにする。
6. kotoba-uiux を foundation / patterns / adapters / legacy migration に整理。DADS の app CSS 委譲と accent 例外の扱いを更新し、重複する旧規則を残さない。

これらの機械検査・公開 catalog・skill 更新は次の実装段階。今回ガイドだけを変えて全体統一済みとは扱わない。

## 採用時の受入条件と進め方

今回：設計、単一 HTML の動く見本、CID fixture、試作音。次段階では account-entry と会話枠を実ライブラリ化し、Itonami ともう一つの app で同じ API を使用して、app 固有 CSS の削減を確認。その後 kotoba.cloud / kotobase.net / Murakumo に広げる。各アプリの移行は別途実施する。

受入条件：360/390/768/1280 CSS px、200%文字拡大、light/dark、キーボードのみ、focus 復元、IME、実スマートフォンのソフトキーボード、reduced-motion、音 off、back/forward、draft 保持、reload/deep link、offline、権限なし、CID 不一致。自動 HTML スコアは補助であり、実機の読みやすさや作業成立の証明ではない。

今回の見本は draft を DOM に保つため hash 切替で残るが、0.2 では明示的に有効化した下書きのみ再読込後も保存する。実機の soft keyboard、screen reader、音の快適性、全パターンの contrast は未認定。

## 出典

- [Cloud Itonami PR #286](https://github.com/cloud-itonami/cloud-itonami-app/pull/286)
- [account-entry を追加したコミット](https://github.com/cloud-itonami/cloud-itonami-app/commit/528da8d0974d795fc2c4e654f8837f3733db07b9)
- jp-go-dds ローカル観測 SHA：581b68cb7699e4017d3532bc17e134a41be00fef。見本はこの checkout の CSS / page / core / tokens を使用。
- [DADS の使い方](https://design.digital.go.jp/dads/guidance/how-to-use/) — 基礎とサービス固有の設計の関係。
- [DADS コンポーネント](https://design.digital.go.jp/dads/components/) — 基礎部品の参照。
- [Apple Motion](https://developer.apple.com/jp/design/human-interface-guidelines/motion) — 動きの意味と設定の尊重の参考。外観を複製する対象ではない。
- [Apple Playing audio](https://developer.apple.com/design/human-interface-guidelines/playing-audio) — 音量・出力・silence への期待の参考。
- [IPFS Immutability](https://docs.ipfs.tech/concepts/immutability/)、[IPNS](https://docs.ipfs.tech/concepts/ipns/) — immutable content と mutable naming の区別。Kotoba の命名実装を IPNS と同一視しない。
