(ns build-preview
  (:require ["node:fs" :as fs]
            ["node:crypto" :as crypto]
            [clojure.string :as str]
            [html.core :as html]
            [jp-go-dds.page :as page]
            [jp-go-dds.core :as dds]
            [jp-go-dds.behavior :as behavior]
            [jp-go-dds.tokens :as tokens]))

(def root (or (first *command-line-args*) "."))
(def upstream (or (second *command-line-args*) (throw (ex-info "Pass output path and jp-go-dds checkout path" {}))))
(def fixture "{\"title\":\"ひとつの操作言語\",\"version\":1,\"body\":\"色だけでなく、配置と振る舞いを共有する。\"}\n")
(defn base32 [bytes]
  (let [alphabet "abcdefghijklmnopqrstuvwxyz234567"]
    (loop [xs (seq bytes) bits 0 acc 0 result ""]
      (cond (>= bits 5) (recur xs (- bits 5) acc (str result (nth alphabet (bit-and 31 (unsigned-bit-shift-right acc (- bits 5))))))
            (seq xs) (recur (next xs) (+ bits 8) (bit-or (bit-shift-left acc 8) (first xs)) result)
            (pos? bits) (str result (nth alphabet (bit-and 31 (bit-shift-left acc (- 5 bits)))))
            :else result))))
(def digest (.digest (.update (.createHash crypto "sha256") fixture "utf8")))
(def cid (str "b" (base32 (concat [1 85 18 32] (array-seq digest)))))
(fs/writeFileSync (str root "/assets/" cid ".json") fixture)
(def css (str (fs/readFileSync (str root "/source/preview.css") "utf8") "\n"
              (fs/readFileSync (str root "/source/interaction.css") "utf8")))
(defn badge [s] [:span {:class "badge"} s])
(defn heading [eyebrow title subtitle]
  [:header {:class "page-heading"} [:p {:class "eyebrow"} eyebrow] [:h1 title] [:p {:class "muted"} subtitle]])
(defn account []
  [:button {:type "button" :class "account-button" :data-open-dialog "account-sheet" :aria-haspopup "dialog" :aria-label "アカウントと設定"}
   [:span {:class "avatar" :aria-hidden "true"} "K"]
   [:span [:strong "Kotoba"] [:small "アカウントと設定"]] [:span {:class "chevron"} "⌄"]])
(defn artifact []
  [:a {:class "artifact" :href "#content"}
   [:span {:class "artifact-icon" :aria-hidden "true"} "↗"]
   [:span [:strong "ひとつの操作言語"] [:small "固定された版 · v1 · JSON"]]
   [:span {:class "muted"} "開く →"]])
(defn workspace []
  [:section {:id "workspace" :class "page workspace-page" :tabindex "-1"}
   (heading "01 / WORKSPACE" "使う場所が変わっても、同じ手触り。" "会話・作業・成果物を、ひとつの画面でつなぐ。")
   [:div {:class "demo-controls"}
    [:label [:input {:type "checkbox" :id "phone"}] "スマートフォン幅"]
    [:span {:class "muted"} "入力した下書きは、上の見本を切り替えても残ります。"]]
   [:div {:class "demo-wrap"}
    [:div {:class "app-shell"}
     [:aside {:class "rail"} (account)
      [:div {:class "rail-section"} [:p {:class "eyebrow"} "WORKSPACE"]
       [:a {:href "#workspace" :class "rail-current"} "◉　会話"]
       [:a {:href "#content"} "◇　成果物"]
       [:a {:href "#components"} "▦　部品の見本"]]
      [:div {:class "rail-bottom"} [:span {:class "brand-mark"} "k"] [:strong "cloud-kotoba-dds"] [:small "Design study · 01"]]]
     [:div {:class "conversation"}
      [:header {:class "conversation-header"}
       [:div {:class "mobile-account"} (account)]
       [:div [:p {:class "eyebrow"} "MURAKUMO"] [:strong "新しい会話"]]
       [:details {:class "model-picker"} [:summary "Basho Preview ⌄"]
        [:div {:class "model-detail"} [:strong "モデルの詳細"] [:p "文章・コード"] [:p {:class "muted"} "モデル選択の配置例です。実接続はありません。"]]]]
      [:div {:class "messages"}
       [:p {:class "sample-label"} "表示と操作の見本 · 実際の AI には送信しません"]
       [:div {:class "user-message"} "Kotoba 全体の UI を、ひとつの言語にしたい。"]
       [:article {:class "assistant-message"}
        [:p {:class "speaker"} [:span {:class "mini-mark"} "k"] "Basho"]
        [:h2 "同じ操作には、同じ応答を。"]
        [:p "DADS の読みやすさと安定した部品を土台に、会話・編集・参照に共通の枠組みを重ねます。"]
        [:p "スマートフォンでは一つの作業に集中し、大きな画面では一覧と詳細を隣に置きます。"]
        (artifact)
        [:details {:class "run-details"} [:summary [:span {:class "status-dot"}] "完了 · 詳細を表示"]
         [:p "サンプルの状態：受付 → 生成 → 保存 → 完了。実行記録ではありません。"]]]
       [:details {:class "reply-demo"} [:summary "サンプル応答を展開"]
        [:div {:class "reveal"} [:p {:class "speaker"} "Basho"] [:p "この応答は 180ms で現れます。入力欄の内容は送信・保存していません。"]]]]
      [:form {:class "composer" :id "composer" :novalidate true}
       [:label {:for "draft" :class "visually-hidden"} "メッセージの下書き"]
       [:textarea {:id "draft" :placeholder "考えていることを書いてください" :rows "2" :maxlength "4000" :aria-describedby "compose-status"}]
       [:div {:class "composer-footer"} [:span "Enter：改行 · ⌘/Ctrl+Enter：試す"]
        [:button {:type "submit" :id "sample-send" :class "ck-primary"} "応答を試す"]]
       [:p {:id "compose-status" :role "status" :aria-live "polite" :aria-atomic "true"} "この端末内だけで動く見本です。"]
       [:button {:type "button" :id "retry" :hidden true} "再試行"]
       [:p {:class "composer-note"} "公開や共有は、内容を確認する別の操作として扱います。"]]
      [:nav {:class "bottom-nav" :aria-label "モバイルの作業"}
       [:a {:href "#workspace"} "◉ 会話"] [:a {:href "#content"} "◇ 成果物"] [:a {:href "#components"} "▦ 部品"]]]]]])
(defn content-view []
  [:section {:id "content" :class "page" :tabindex "-1"}
   (heading "02 / CONTENT" "リンクは、場所よりも内容へ。" "固定された版と、更新を追う名前を、見た目でも操作でも分けます。")
   [:div {:class "content-grid"}
    [:article {:class "paper"} (badge "固定された版 / v1") [:h2 "ひとつの操作言語"]
     [:p "色だけでなく、配置と振る舞いを共有する。"]
     [:p {:class "muted"} "この文章の JSON ファイルから、実際に CIDv1（raw / SHA-256）を計算しています。"]
     [:a {:class "text-link" :href (str "assets/" cid ".json") :download true} "内容の JSON をダウンロード ↓"]]
    [:aside {:class "inspector"} [:h2 "このリンクについて"]
     [:dl [:dt "対象"] [:dd "内容そのもの / 固定版"] [:dt "識別子"] [:dd [:code cid]]
      [:dt "取得経路"] [:dd "この見本に同梱したファイル"] [:dt "検証"] [:dd "作成時に算出・検算済み。ブラウザでの再検証は未実装。"]
      [:dt "共有範囲"] [:dd "公開用のサンプル。CID はアクセス権を与えません。"]]
     [:details [:summary "最新を追うリンクとの違い"]
      [:p "固定リンクは同じ版を指します。名前へのリンクは更新されうるため、解決時の CID・時刻・権限を別に扱います。"]
      [:p {:class "muted"} "この見本には名前解決サービス・IPFS 公開・署名検証は接続していません。"]]]]
   [:a {:class "text-link" :href "#workspace"} "← 会話へ戻る"]])
(defn components []
  [:section {:id "components" :class "page" :tabindex "-1"}
   (heading "03 / COMPONENTS" "独自に描き直さないための、共有部品。" "DADS の基礎部品と、Kotoba が所有するアプリのパターンを分ける。")
   [:div {:class "component-grid"}
    [:article {:class "tile"} (badge "jp-go-dds / 再利用") [:h2 "基本操作"]
     [:p "ボタン・フォーカス・文字・色は DADS を継承。"]
     (dds/button "会話の見本へ" {:href "#workspace" :type :solid-fill})]
    [:article {:class "tile"} (badge "cloud-kotoba-dds / 提案") [:h2 "アカウント入口"] (account)
     [:p {:class "muted"} "小さな識別子と名前。詳細は必要なときに開く。"]]
    [:article {:class "tile"} (badge "cloud-kotoba-dds / 提案") [:h2 "成果物へのリンク"] (artifact)
     [:p {:class "muted"} "タイトルを読む。版を見分ける。CID は詳細で確認。"]]
    [:article {:class "tile"} (badge "cloud-kotoba-dds / 提案") [:h2 "状態の語彙"]
     [:div {:class "state-list"} [:span "○ 待機"] [:span "◌ 実行中"] [:span "✓ 完了"] [:span "! 対応が必要"]]
     [:p {:class "muted"} "色や音だけで状態を伝えず、必ず言葉を添える。"]]]
   [:div {:class "principle-strip"} [:strong "同じ意味 → 同じ部品 → 同じ操作 → 同じ応答"]
    [:p "製品名や内容が変わっても、部品の寸法や動きは変更しません。"]]])
(defn behavior []
  [:section {:id "behavior" :class "page" :tabindex "-1"}
   (heading "04 / FEEDBACK" "動きと音は、結果を伝えるために。" "静かな初期状態。必要なときだけ、意味のあるフィードバック。")
   [:div {:class "component-grid"}
    [:article {:class "tile"} [:h2 "Motion"] [:p "押下 100ms / 出現 180ms / 面の切替 240ms"]
     [:details {:class "motion-demo"} [:summary "開閉を試す"] [:div {:class "reveal"} [:strong "内容が開きました"] [:p "短い移動と透明度の変化だけ。閉じて何度でも試せます。"]]]
     [:p {:class "muted"} "OS の「視差効果を減らす」と、上部の「動きを抑える」を尊重します。"]]
    [:article {:class "tile"} [:h2 "Sound"] [:p "自動再生なし。短い完了音を、ここで試聴できます。"]
     [:audio {:controls true :preload "none" :src "assets/complete.wav" :aria-label "完了音の試聴"} "音声を再生できません。"]
     [:p {:class "muted"} "220ms の試作音。採用前に実機で音量と聞き疲れを確認します。"]]
    [:article {:class "tile"} [:h2 "意味を揃える"]
     [:dl [:dt "完了"] [:dd "確定後、一度だけ。音は本人が有効にした場合のみ。"]
      [:dt "エラー"] [:dd "原因と次の操作を文字で示す。音で急かさない。"]
      [:dt "ストリーミング"] [:dd "文字ごとの音・跳ね・点滅を使わない。"]]]
    [:article {:class "tile"} [:h2 "残すもの"]
     [:p "画面を切り替えても下書きと作業対象を残す。ネットワークが遅くても、入力を奪わない。"]
     [:p {:class "muted"} "永続保存、再接続、スクロール復元は製品実装時の受入条件です。"]]]])
(def body
  [:div {:class "study"}
   [:a {:class "skip" :href "#workspace"} "見本へ移動"]
   [:header {:class "study-header"} [:a {:class "wordmark" :href "#workspace"} [:span {:class "brand-mark"} "k"] "cloud-kotoba-dds"]
    [:span {:class "edition"} "DESIGN STUDY / 2026.09"]]
   [:div {:class "study-bar"}
    [:nav {:aria-label "見本の切替"} [:a {:href "#workspace"} "ワークスペース"] [:a {:href "#content"} "リンク"] [:a {:href "#components"} "コンポーネント"] [:a {:href "#behavior"} "動きと音"]]
    [:div {:class "preferences"} [:label [:input {:id "dark" :type "checkbox"}] "ダーク"] [:label [:input {:id "reduce" :type "checkbox"}] "動きを抑える"]]]
   [:main (workspace) (content-view) (components) (behavior)]
   [:footer {:class "study-footer"} [:span "jp-go-dds foundations / cloud-kotoba-dds patterns"]
    [:a {:href "design.md"} "共通設計を読む ↗"]]])

(defn language-menu []
  (dds/language-selector {:id-prefix "ck-language" :current "ja"
    :languages [{:code "ja" :label "日本語" :href "?lang=ja"}
                {:code "en" :label "English" :href "?lang=en"}]}))
(defn settings-sheet []
  [:dialog {:id "account-sheet" :class "ck-sheet" :aria-labelledby "settings-title"}
   [:div {:class "sheet-head"} [:h2 {:id "settings-title"} "アカウントと設定"]
    [:button {:type "button" :data-close-dialog true :autofocus true} "閉じる"]]
   [:p "Kotoba · 個人のワークスペース"]
   [:p {:class "muted"} "設定はこの見本だけに適用されます。"]
   [:h3 "言語"] (language-menu)
   [:p {:class "muted"} "画面の言語だけを変更します。原文と回答言語は別です。"]
   [:label {:for "answer-language"} "サンプル回答の言語"]
   [:select {:id "answer-language"} [:option {:value "ja"} "日本語"] [:option {:value "en"} "English"]]
   [:h3 "保存とフィードバック"]
   [:label [:input {:id "persist-draft" :type "checkbox"}] "下書きをこの端末に保存"]
   [:label [:input {:id "sound-enabled" :type "checkbox"}] "完了音を有効にする"]
   [:button {:type "button" :id "clear-draft"} "保存した下書きを削除"]
   [:p {:id "settings-status" :role "status"}]
   [:h3 "失敗からの復旧を試す"]
   [:label [:input {:id "simulate-offline" :type "checkbox"}] "接続切れを再現"]
   [:p {:class "muted"} "実際の通信は行いません。オフに戻して再試行できます。"]])

(def body-v2
  [:<> [:div {:class "global-tools"} [:span {:class "badge"} "0.2 / INTERACTION STUDY"]
    [:button {:type "button" :data-open-dialog "account-sheet" :aria-haspopup "dialog"} "言語・設定"]]
   [:p {:class "locale-note"} "見本の原文は日本語です。UI の言語とは独立しています。"]
   body (settings-sheet)
   [:script behavior/language-selector-script]
   [:script {:src "assets/interaction.js" :defer true}]])
(fs/writeFileSync (str root "/index.html")
  ;; Local html/->html calls the one-arity text/join, absent in this text checkout.
  ;; Use the same upstream renderer with an explicit host string join; no repo edits.
  (str "<!doctype html>\n" (str/join "" (persistent! (html/render-node
  (page/page {:title "cloud-kotoba-dds — Design study" :lang "ja"
               :css (fs/readFileSync (str upstream "/resources/jp_go_dds/dds.css") "utf8")
               :app-css (str tokens/bridge-css "\n" behavior/language-selector-css "\n" css)} body-v2) (transient []))))))
(fs/writeFileSync (str root "/assets/content-id.txt") (str cid "\n"))
(println "Built preview" cid)
