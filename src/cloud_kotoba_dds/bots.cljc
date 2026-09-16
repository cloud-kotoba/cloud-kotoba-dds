(ns cloud-kotoba-dds.bots
  "Bots workspace pattern — the rounded, conversation-list layout of the
   Cloud Itonami `#/bots` view (owner decision 2026-09-16: 「この角丸的な
   grok bots 的な詳細なレイアウトは cloud-kotoba-dds に反映して」), as
   portable Hiccup + one token-contract stylesheet (`styles/bots-css`).

   Shape, in reading order:

     ck-bots
     ├─ rail            search · grouped Bot rows (sticky group labels) · launcher
     └─ main            titlebar (refs chip · avatar · name/status · actions)
                        disclosure (profile / learning)
                        feed (result cards, messages)
                        composer (prompt · send · hint)

   What this owns: structure, the surface tokens (ground / raised / hover /
   border, lifted in dark so cards read as cards), radii, the row and card
   anatomy, the two width bands. What the host owns: every fact (names,
   statuses, dates, counts), the Bot avatar hydration (`cloud-kotoba-dds.bot`),
   ids, event bindings, routing, and what a click does. No state lives here.

   Theme: the stylesheet is written on `--hig-*` / DADS semantic tokens, so it
   follows `jp-go-dds.dark` (OS preference, `[data-theme]`) and any host
   appearance layer that inverts the primitives. The three dark surface lifts
   use `light-dark()` over the `--dds-light-*` snapshot names that layer
   emits — they are DERIVED from the grey ramp (`color-mix`), never new
   literals — so a host that draws its own dark palette by hand does not
   need to draw this pattern again.

   Every element carries a `data-ck-bots` hook the host may target; class
   names are the styling contract and stay stable across versions."
  (:require [kotoba.lang.text :as str]))

(defn- with-class [attrs class]
  (assoc attrs :class (str class (when (:class attrs) (str " " (:class attrs))))))

(defn- container [tag class hook attrs children]
  (into [tag (assoc (with-class attrs class) :data-ck-bots hook)] children))

;; ---------- frame ----------

(defn workspace
  "The two-column frame. `rail` and `main` are the two children below;
   `attrs` go on the root (`:aria-label` names the region)."
  [attrs & children]
  (container :section "ck-bots" "workspace" attrs children))

(defn rail
  "The conversation list column: `rail-search`, `rail-list`, `rail-launcher`."
  [attrs & children]
  (container :aside "ck-bots__rail" "rail" attrs children))

(defn main
  "The Bot's own column: `titlebar`, `disclosure`, `feed`, `composer`."
  [attrs & children]
  (container :div "ck-bots__main" "main" attrs children))

;; ---------- rail ----------

(defn rail-search
  "The search pill at the top of the rail. `attrs` on the input; the host
   supplies `:id`, `:aria-label` and `:placeholder`."
  [attrs]
  [:div {:class "ck-bots__search" :data-ck-bots "search"}
   [:span {:class "ck-bots__search-mark" :aria-hidden "true"} "⌕"]
   [:input (merge {:type "search" :class "ck-bots__search-input" :autocomplete "off"} attrs)]])

(defn rail-list
  "The scrolling list of groups."
  [attrs & groups]
  (container :div "ck-bots__list" "list" attrs groups))

(defn rail-group
  "One dated group: a sticky label (「今日」「過去7日間」) over its rows."
  [attrs label & items]
  (into [:ul (assoc (with-class attrs "ck-bots__group") :data-ck-bots "group")
         [:li {:class "ck-bots__group-label" :data-ck-bots "group-label"} label]]
        items))

(defn rail-item
  "One Bot row. `:avatar` is the hiccup mount from `cloud-kotoba-dds.bot/avatar`
   (or any 2.5rem square); `:name` the Bot's name; `:meta` the one-line state
   (「待機中 · 次回 9/11 00:55」); `:time` the trailing short date; `:unread?`
   draws the dot; `:current?` marks the selected row; `:attrs` go on the
   button (the host's `:id` / `data-*` / handlers)."
  [{:keys [avatar name meta time unread? current? attrs]}]
  [:li {:class "ck-bots__row" :data-ck-bots "row"}
   [:button (merge {:type "button"
                    :class (str "ck-bots__item" (when current? " is-current"))
                    :aria-current (when current? "true")
                    :data-ck-bots "item"}
                   attrs)
    [:span {:class "ck-bots__avatar" :aria-hidden "true"} avatar]
    [:span {:class "ck-bots__copy"}
     [:span {:class "ck-bots__headline"}
      [:span {:class "ck-bots__name" :data-ck-bots "name"} name]
      (when time [:time {:class "ck-bots__time" :data-ck-bots "time"} time])]
     (when meta [:span {:class "ck-bots__meta" :data-ck-bots "meta"} meta])]
    (when unread?
      [:span {:class "ck-bots__dot" :data-ck-bots "unread" :role "img" :aria-label "未読"}])]])

(defn rail-launcher
  "The foot of the rail: the launcher links (App / マーケットプレイス) and the
   account entry (`cloud-kotoba-dds.shell/account-entry` fits here)."
  [attrs & children]
  (container :footer "ck-bots__launcher" "launcher" attrs children))

(defn launcher-link
  "One launcher row: `{:href :label :mark :attrs}`; `:mark` is a leading glyph."
  [{:keys [href label mark attrs]}]
  [:a (merge {:class "ck-bots__launch" :href href :data-ck-bots "launch"} attrs)
   (when mark [:span {:class "ck-bots__launch-mark" :aria-hidden "true"} mark])
   [:span label]])

;; ---------- main ----------

(defn chip
  "A small rounded counter/label chip (「参照 0」). `:attrs` on the element;
   `:as` :button makes it a control."
  [{:keys [label as attrs]}]
  (if (= as :button)
    [:button (merge {:type "button" :class "ck-bots__chip" :data-ck-bots "chip"} attrs) label]
    [:span (merge {:class "ck-bots__chip" :data-ck-bots "chip"} attrs) label]))

(defn titlebar
  "The Bot's header: leading `:refs` (a `chip`), the `:avatar` mount, `:name`
   and one-line `:status`, then `:actions` (hiccup controls; the last one is
   the primary 「＋ 新しい Bot」 when marked `:primary`)."
  [{:keys [refs avatar name status actions attrs]}]
  [:header (assoc (with-class (or attrs {}) "ck-bots__titlebar") :data-ck-bots "titlebar")
   (when refs [:div {:class "ck-bots__refs"} refs])
   [:div {:class "ck-bots__identity"}
    (when avatar [:span {:class "ck-bots__avatar ck-bots__avatar--title" :aria-hidden "true"} avatar])
    [:div {:class "ck-bots__title-copy"}
     [:h2 {:class "ck-bots__title-name" :data-ck-bots "title-name"} name]
     (when status [:p {:class "ck-bots__title-status" :data-ck-bots "title-status"} status])]]
   (into [:div {:class "ck-bots__actions"}] actions)])

(defn action
  "A titlebar control: `{:label :primary? :attrs}`."
  [{:keys [label primary? attrs]}]
  [:button (merge {:type "button"
                   :class (str "ck-bots__action" (when primary? " ck-bots__action--primary"))
                   :data-ck-bots "action"}
                  attrs)
   label])

(defn disclosure
  "A collapsed section under the titlebar (「この Bot のプロフィール・学習」).
   `attrs` on the `<details>` (`:open true` to start open)."
  [attrs summary & body]
  (into [:details (assoc (with-class attrs "ck-bots__disclosure") :data-ck-bots "disclosure")
         [:summary {:class "ck-bots__disclosure-summary"} summary]]
        body))

(defn feed
  "The scrolling middle: cards, messages, notes. `:aria-label` names it."
  [attrs & children]
  (container :div "ck-bots__feed" "feed" (merge {:role "region" :tabindex 0} attrs) children))

(defn feed-note
  "A centred, quiet marker between cards (「自動確認の内部指示」)."
  [attrs & children]
  (container :p "ck-bots__note" "note" attrs children))

(defn result-card
  "One outcome row: `:title` (「自動確認の結果」), `:tag` with `:tag-state`
   (:ok / :error / :warn / :neutral), the one-line `:summary`, and `:more`
   — a hiccup control (「全文を見る」) the host wires."
  [{:keys [title tag tag-state summary more attrs]}]
  [:article (assoc (with-class (or attrs {}) "ck-bots__card") :data-ck-bots "card")
   [:h3 {:class "ck-bots__card-title"} title]
   (when tag
     [:span {:class "ck-bots__tag" :data-state (name (or tag-state :neutral)) :data-ck-bots "tag"} tag])
   [:p {:class "ck-bots__card-summary" :data-ck-bots "summary"} summary]
   (when more [:span {:class "ck-bots__card-more"} more])])

(defn bubble
  "A message body panel (the dark rounded block in the feed). `:role`
   :bot or :person picks the side and fill."
  [{:keys [role attrs]} & children]
  (into [:div (assoc (with-class (or attrs {}) "ck-bots__bubble")
                     :data-role (name (or role :bot)) :data-ck-bots "bubble")]
        children))

;; ---------- composer ----------

(defn composer
  "The bottom form: `prompt`, `send`, `composer-hint`. `attrs` on the form."
  [attrs & children]
  (container :form "ck-bots__composer" "composer" attrs children))

(defn prompt
  "The rounded textarea. Host supplies `:id`, `:placeholder`, `:aria-label`."
  [attrs]
  [:textarea (merge {:class "ck-bots__prompt" :rows 3 :data-ck-bots "prompt"} attrs)])

(defn send
  "The send control beside the prompt."
  [attrs label]
  [:button (merge {:type "submit" :class "ck-bots__send" :data-ck-bots "send"} attrs) label])

(defn composer-hint
  "The one-line key hint under the prompt (「Enter で改行 · ⌘ / Ctrl + Enter で送信」)."
  [attrs text]
  [:p (assoc (with-class (or attrs {}) "ck-bots__hint") :data-ck-bots "hint") text])

(defn rail-toggle
  "The narrow-band control that shows the rail over the main column. Toggle
   `.show-rail` on the workspace root; below the band it is visible, above
   it is hidden by the stylesheet."
  [attrs label]
  [:button (merge {:type "button" :class "ck-bots__rail-toggle" :data-ck-bots "rail-toggle"
                   :aria-expanded "false"}
                  attrs)
   label])
