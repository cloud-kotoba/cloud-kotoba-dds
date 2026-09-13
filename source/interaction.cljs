(ns cloud-kotoba-dds.interaction)

;; Prototype browser adapter. No network calls or authentication. Product adapters
;; must consume real execution/authorization state; this is a local state fixture.
(defn $ [s] (.querySelector js/document s))
(defn all [s] (seq (.querySelectorAll js/document s)))
(defn on [node event f] (.addEventListener node event f))
(defn read-store [k] (try (.getItem js/localStorage (str "cloud-kotoba-dds.demo.v2/" k)) (catch :default _ nil)))
(defn write-store [k v]
  (try (if (nil? v) (.removeItem js/localStorage (str "cloud-kotoba-dds.demo.v2/" k))
           (.setItem js/localStorage (str "cloud-kotoba-dds.demo.v2/" k) v)) true
       (catch :default _ false)))
(def translations
  {"見本の切替" "Study navigation" "モバイルの作業" "Mobile workspace" "完了音の試聴" "Preview completion sound"
   "ワークスペース" "Workspace" "リンク" "Links" "コンポーネント" "Components" "動きと音" "Motion & sound"
   "ダーク" "Dark" "動きを抑える" "Reduce motion" "スマートフォン幅" "Phone width"
   "言語・設定" "Language & settings" "アカウントと設定" "Account & settings" "閉じる" "Close"
   "言語" "Language" "サンプル回答の言語" "Sample reply language"
   "設定はこの見本だけに適用されます。" "These settings apply to this study only."
   "画面の言語だけを変更します。原文と回答言語は別です。" "This changes the interface language, not the source or reply language."
   "保存とフィードバック" "Storage & feedback" "下書きをこの端末に保存" "Save drafts on this device"
   "完了音を有効にする" "Enable completion sound" "保存した下書きを削除" "Delete saved draft"
   "失敗からの復旧を試す" "Try recovery" "接続切れを再現" "Simulate disconnection"
   "実際の通信は行いません。オフに戻して再試行できます。" "No network request is made. Turn this off, then retry."
   "見本の原文は日本語です。UI の言語とは独立しています。" "Reference content remains in Japanese, independently of the interface language."
   "Kotoba · 個人のワークスペース" "Kotoba · Personal workspace"
   "使う場所が変わっても、同じ手触り。" "Different places. One familiar experience."
   "会話・作業・成果物を、ひとつの画面でつなぐ。" "Connect conversations, work and content in one workspace."
   "入力した下書きは、上の見本を切り替えても残ります。" "Your draft stays with you when you switch views."
   "◉　会話" "◉  Conversations" "◇　成果物" "◇  Content" "▦　部品の見本" "▦  Components"
   "◉ 会話" "◉ Chat" "◇ 成果物" "◇ Content" "▦ 部品" "▦ Components"
   "新しい会話" "New conversation" "モデルの詳細" "Model details" "文章・コード" "Text & code"
   "モデル選択の配置例です。実接続はありません。" "A model control example; no model is connected."
   "表示と操作の見本 · 実際の AI には送信しません" "Interactive study · Nothing is sent to an AI"
   "固定された版 · v1 · JSON" "Pinned version · v1 · JSON" "開く →" "Open →"
   "完了 · 詳細を表示" "Complete · Show details" "サンプル応答を展開" "Expand sample reply"
   "メッセージの下書き" "Message draft" "考えていることを書いてください" "Write what is on your mind"
   "Enter：改行 · ⌘/Ctrl+Enter：試す" "Enter: new line · ⌘/Ctrl+Enter: try"
   "応答を試す" "Try a reply" "再試行" "Retry" "この端末内だけで動く見本です。" "This example runs only on this device."
   "公開や共有は、内容を確認する別の操作として扱います。" "Publishing and sharing are separate, reviewable actions."
   "リンクは、場所よりも内容へ。" "Link to content, beyond its location."
   "固定された版と、更新を追う名前を、見た目でも操作でも分けます。" "Distinguish a pinned version from a name that follows updates."
   "固定された版 / v1" "Pinned version / v1" "内容の JSON をダウンロード ↓" "Download the JSON ↓"
   "このリンクについて" "About this link" "対象" "Target" "内容そのもの / 固定版" "Content / pinned version"
   "識別子" "Identifier" "取得経路" "Transport" "この見本に同梱したファイル" "File included in this study"
   "検証" "Verification" "共有範囲" "Access" "最新を追うリンクとの違い" "How is a name link different?"
   "← 会話へ戻る" "← Back to conversation"
   "独自に描き直さないための、共有部品。" "Shared components, without reinvention."
   "DADS の基礎部品と、Kotoba が所有するアプリのパターンを分ける。" "DADS foundations, with app patterns owned by Kotoba."
   "jp-go-dds / 再利用" "jp-go-dds / reused" "cloud-kotoba-dds / 提案" "cloud-kotoba-dds / proposed"
   "基本操作" "Basic actions" "会話の見本へ" "Open workspace" "アカウント入口" "Account entry"
   "成果物へのリンク" "Content link" "状態の語彙" "State vocabulary" "○ 待機" "○ Idle" "◌ 実行中" "◌ Running"
   "✓ 完了" "✓ Complete" "! 対応が必要" "! Action needed"
   "同じ意味 → 同じ部品 → 同じ操作 → 同じ応答" "Same meaning → Same component → Same action → Same feedback"
   "動きと音は、結果を伝えるために。" "Motion and sound communicate outcomes."
   "静かな初期状態。必要なときだけ、意味のあるフィードバック。" "Quiet by default. Meaningful feedback when needed."
   "開閉を試す" "Try disclosure" "内容が開きました" "Content revealed"
   "意味を揃える" "Consistent meanings" "完了" "Complete" "エラー" "Error" "ストリーミング" "Streaming"
   "残すもの" "What persists" "共通設計を読む ↗" "Read the design ↗" "見本へ移動" "Skip to workspace"})
(def locale (atom "ja"))
(def status-copy (atom nil))
(defn t [ja en] (if (= @locale "en") en ja))
(def text-records (js/Array.))
(def attr-records (js/Array.))
(defn collect-translations! []
  (let [walker (.createTreeWalker js/document js/document.body js/NodeFilter.SHOW_TEXT)]
    (loop [n (.nextNode walker)]
      (when n
        (let [raw (.-nodeValue n) key (.trim raw) parent (.-parentElement n)]
          (when (and parent (not (.closest parent "script,style,textarea,option,[data-language-selector]")) (not= key ""))
            (if-let [en (get translations key)]
              (.push text-records #js {:node n :ja raw :en (.replace raw key en)})
              ;; Explicit source-language markup for untranslated reference copy.
              (when (re-find #"[ぁ-んァ-ヶ一-龠]" key)
                (.setAttribute parent "lang" "ja")))))
        (recur (.nextNode walker)))))
  (doseq [el (all "[placeholder],[aria-label]") attr ["placeholder" "aria-label"]]
    (let [ja (.getAttribute el attr)]
      (when-let [en (get translations ja)] (.push attr-records #js {:node el :attr attr :ja ja :en en})))))
(defn apply-language! [lang]
  (reset! locale (if (= lang "en") "en" "ja"))
  (set! (.-lang js/document.documentElement) @locale)
  (doseq [r (seq text-records)] (set! (.-nodeValue (.-node r)) (aget r @locale)))
  (doseq [r (seq attr-records)] (.setAttribute (.-node r) (.-attr r) (aget r @locale)))
  (when-let [[ja en] @status-copy]
    (set! (.-textContent ($ "#compose-status")) (t ja en)))
  (let [label (if (= @locale "en") "English" "日本語")]
    (set! (.-textContent ($ "[data-language-selector-current]")) label)
    (.setAttribute ($ "[data-language-selector-opener]") "aria-label" (str "Language: " label))
    (doseq [item (all "[data-language-selector-item]")]
      (if (= (.getAttribute item "lang") @locale)
        (.setAttribute item "aria-current" "true") (.removeAttribute item "aria-current"))))
  (write-store "language" @locale))

(def opener (atom nil))
(defn open-sheet! [button]
  (reset! opener button)
  (.showModal ($ "#account-sheet")))
(defn close-sheet! [] (.close ($ "#account-sheet")))
(defn save-draft! []
  (when (.-checked ($ "#persist-draft"))
    (when-not (write-store "draft" (.-value ($ "#draft")))
      (set! (.-textContent ($ "#compose-status")) (t "保存できません。下書きはこの画面に残っています。" "Storage unavailable. Your draft remains in this view.")))))
(defn autosize! []
  (let [input ($ "#draft")]
    (set! (.. input -style -height) "auto")
    (set! (.. input -style -height) (str (min 160 (max 70 (.-scrollHeight input))) "px"))))
(def running (atom false))
(def composing (atom false))
(defn set-status! [state ja en]
  (reset! status-copy [ja en])
  (.setAttribute ($ "#composer") "data-state" state)
  (set! (.-textContent ($ "#compose-status")) (t ja en)))
(defn try-reply! []
  (when-not (or @running @composing)
    (let [draft (.-value ($ "#draft")) input ($ "#draft")]
      (cond
        (= "" (.trim draft))
        (do (.setAttribute input "aria-invalid" "true")
            (set-status! "invalid" "メッセージを入力してください。" "Enter a message first.") (.focus input))
        (.-checked ($ "#simulate-offline"))
        (do (set! (.-hidden ($ "#retry")) false)
            (set-status! "offline" "接続切れの再現中。設定でオフにして再試行してください。下書きは残っています。" "Simulated disconnection. Turn it off in settings and retry. Your draft is safe."))
        :else
        (do
          (.removeAttribute input "aria-invalid")
          (reset! running true)
          (set! (.-disabled ($ "#sample-send")) true)
          (set! (.-hidden ($ "#retry")) true)
          (set-status! "running" "サンプル応答を準備中…" "Preparing a sample reply…")
          (js/setTimeout
           (fn []
             (let [message (.createElement js/document "article")
                   body (.createElement js/document "p")
                   answer-lang (.-value ($ "#answer-language"))]
               (set! (.-className message) "assistant-message sample-result reveal")
               (.setAttribute message "lang" answer-lang)
               (set! (.-textContent body) (if (= answer-lang "en") "Sample reply: your input stayed on this device. No AI or server was contacted." "サンプル応答：入力はこの端末内で扱いました。AI やサーバーには送信していません。"))
               (.appendChild message body) (.appendChild ($ ".messages") message)
               (reset! running false) (set! (.-disabled ($ "#sample-send")) false)
               ;; Never clear edits made while a reply was pending.
               (when (= draft (.-value input)) (set! (.-value input) ""))
               (autosize!) (save-draft!)
               (set-status! "complete" "サンプル完了。応答は会話欄の末尾にあります。" "Sample complete. The reply is at the end of the conversation.")
               (when (.-checked ($ "#sound-enabled"))
                 (-> (.play ($ "audio")) (.catch (fn [_] nil)))))) 600))))))

(defn route! []
  (let [hash (.-hash js/location) valid #{"#workspace" "#content" "#components" "#behavior"}
        target (if (contains? valid hash) ($ hash) ($ "#workspace"))]
    (doseq [link (all ".study-bar nav a,.bottom-nav a")]
      (if (= (.getAttribute link "href") (str "#" (.-id target)))
        (.setAttribute link "aria-current" "page") (.removeAttribute link "aria-current")))
    (.focus target #js {:preventScroll true})))

(collect-translations!)
(apply-language! (or (.get (js/URLSearchParams. (.-search js/location)) "lang") (read-store "language") "ja"))
(doseq [b (all "[data-open-dialog]")] (on b "click" #(open-sheet! b)))
(doseq [b (all "[data-close-dialog]")] (on b "click" close-sheet!))
(on ($ "#account-sheet") "close" (fn [] (when @opener (.focus @opener))))
;; DADS handles Escape inside its own menu. Once the popup is closed, the
;; enclosing dialog owns Escape; do not let the opener swallow it forever.
(.addEventListener ($ "#account-sheet") "keydown"
  (fn [e]
    (when (and (= (.-key e) "Escape")
               (.closest (.-target e) "[data-language-selector]")
               (.-hidden ($ "[data-language-selector-popup]")))
      (.preventDefault e) (.stopPropagation e) (close-sheet!))) true)
(on js/document "click"
    (fn [e]
      (when-let [item (.closest (.-target e) "[data-language-selector-item]")]
        (.preventDefault e)
        (apply-language! (.getAttribute item "lang"))
        (.focus ($ "[data-language-selector-opener]")))))
(on ($ "#composer") "submit" (fn [e] (.preventDefault e) (try-reply!)))
(on ($ "#retry") "click" try-reply!)
(on ($ "#draft") "compositionstart" #(reset! composing true))
(on ($ "#draft") "compositionend" #(reset! composing false))
(on ($ "#draft") "keydown"
    (fn [e] (when (and (= (.-key e) "Enter") (or (.-metaKey e) (.-ctrlKey e)) (not (.-isComposing e)) (not @composing))
              (.preventDefault e) (try-reply!))))
(on ($ "#draft") "input" (fn [] (.removeAttribute ($ "#draft") "aria-invalid") (autosize!) (save-draft!)))
(on ($ "#persist-draft") "change"
    (fn [] (let [enabled (.-checked ($ "#persist-draft"))]
             (write-store "persist" (if enabled "yes" nil))
             (if enabled (save-draft!) (write-store "draft" nil)))))
(on ($ "#clear-draft") "click"
    (fn [] (let [cleared (write-store "draft" nil)]
      (set! (.-checked ($ "#persist-draft")) false) (write-store "persist" nil)
      (set! (.-textContent ($ "#settings-status"))
        (if cleared (t "保存分を削除しました。編集中の下書きは残しています。" "Saved draft deleted. Your current draft is unchanged.")
                    (t "保存領域を操作できません。" "Storage is unavailable."))))))
(on js/window "hashchange" route!)
(on js/document "keydown"
    (fn [e] (when (and (= (.-key e) "Escape") (not (.-open ($ "#account-sheet")))
              (doseq [details (all "details[open]")]
                (set! (.-open details) false) (.focus (.querySelector details "summary")))))))
(on js/document "click"
    (fn [e] (doseq [details (all ".model-picker[open]")]
              (when-not (.contains details (.-target e)) (set! (.-open details) false)))))
(when (= "yes" (read-store "persist"))
  (set! (.-checked ($ "#persist-draft")) true)
  (set! (.-value ($ "#draft")) (or (read-store "draft") "")))
;; visualViewport provides keyboard-aware sizing where implemented. It is not
;; proof of iOS/Android keyboard behavior; those require the real-device matrix.
(defn viewport! []
  (let [vp (.-visualViewport js/window)]
    (when vp
      (.setProperty (.. js/document -documentElement -style) "--ck-visible-height" (str (.-height vp) "px")))))
(when (.-visualViewport js/window) (on (.-visualViewport js/window) "resize" viewport!))
(viewport!) (autosize!) (route!)
