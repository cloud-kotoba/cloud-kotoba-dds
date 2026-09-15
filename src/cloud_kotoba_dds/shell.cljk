(ns cloud-kotoba-dds.shell
  "App-shell chrome pattern (design.md: shell / account-entry / navigation):
   the console TOP BAR that stays put while the content scrolls, and the
   ACCOUNT ENTRY — a chip at the foot of the rail whose menu FLOATS over the
   content instead of pushing the rail apart.

   Owner observation 2026-09-15 on kotoba.cloud: the top bar scrolled away
   with the page and the account menu opened in flow (the rail grew by the
   menu's height). Both are chrome that stopped being chrome. The two
   elements carry shinkansen.audit's :chrome-layers markers
   (data-chrome=top / data-chrome=float) so a document that uses this
   pattern is MEASURED against the layer rules, not trusted to have them.

   Apps own the facts (the section name, the chips, the person's name and
   workspace, the menu items and what sign-out does); this owns the
   structure, the layer rules and the hydration protocol. Both account
   states are emitted server-side — the signed-out control visible, the
   session chip + menu hidden — so the document carries the menu's layer
   rule before any session is known and the host only fills and reveals
   (script → cloudKotobaShell.hydrateSession): no chrome markup is built
   in the browser.

   Load the jp-go-dds token bridge before css. Pure hiccup + CSS; the
   browser side is `script`, one JS string the host ships as a file."
  (:require [kotoba.lang.text :as str]))

(def rail-min-width
  "The band from which the rail is a left column (the menu opens UPWARD
   from the chip at its foot). Below it the rail is a chip row at the top
   and the menu drops DOWN under the chip. Apps that place the rail on a
   different breakpoint override the two @media rules, not the layers."
  "64rem")

(def css
  "Token-contract CSS for the shell chrome. App CSS may extend colors and
   spacing; never re-derive the two layer rules — they are what
   :chrome-layers measures."
  (str
   ;; --- top bar: sticky at the top of the scroll container --------------
   ".ck-topbar[data-chrome=top]{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--hig-spacing-3);min-height:3rem;padding:var(--hig-spacing-2) var(--hig-spacing-5);border-block-end:1px solid var(--hig-color-separator);background:var(--hig-color-system-background)}"
   ".ck-topbar__section{display:flex;align-items:center;gap:var(--hig-spacing-2);font-weight:700;min-inline-size:0}"
   ".ck-topbar__group{color:var(--hig-color-secondary-label)}"
   ".ck-topbar__sep{margin:0 var(--hig-spacing-2);color:var(--hig-color-secondary-label)}"
   ".ck-topbar__actions{display:flex;align-items:center;gap:var(--hig-spacing-2);flex-wrap:wrap}"
   ;; --- account entry: the chip and the floating menu -------------------
   ".ck-account{position:relative;inline-size:100%}"
   ;; hidden= must win over a component's own display (dads-button is
   ;; inline-flex): the sign-in control hides when the session is revealed
   ".ck-account [hidden]{display:none!important}"
   ".ck-account__session{inline-size:100%}"
   ".ck-account__chip{display:flex;align-items:center;justify-content:flex-start;gap:var(--hig-spacing-2);inline-size:100%;min-height:2.25rem;padding:var(--hig-spacing-1) var(--hig-spacing-2);border-radius:var(--hig-radius-xs,6px);color:var(--hig-color-label);font:inherit;font-size:var(--hig-text-subheadline-font-size);font-weight:600;line-height:1.25;background:none;border:none;cursor:pointer;text-align:start;list-style:none;box-sizing:border-box}"
   ".ck-account__chip:hover{background:var(--hig-color-system-background)}"
   ".ck-account__chip::-webkit-details-marker{display:none}"
   ".ck-account__chip:focus-visible{outline:2px solid var(--hig-color-tint);outline-offset:2px}"
   ".ck-account__avatar{flex:none;inline-size:1.5rem;block-size:1.5rem;display:grid;place-items:center;border-radius:var(--hig-radius-capsule,999px);background:var(--hig-color-tint);color:var(--hig-color-system-background);font-size:var(--hig-text-caption1-font-size);font-weight:700}"
   ".ck-account__name{display:grid;min-inline-size:0}"
   ".ck-account__name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
   ".ck-account__ws{font-size:var(--hig-text-caption2-font-size);font-weight:400;line-height:1.2;color:var(--hig-color-secondary-label)}"
   ".ck-account__caret{margin-inline-start:auto;color:var(--hig-color-secondary-label);transition:transform 120ms}"
   ".ck-account__session[open] .ck-account__caret{transform:rotate(180deg)}"
   ;; the menu floats: absolute + z-index; below the rail band it drops
   ;; down under the chip (top:100%), on the rail it opens upward from the
   ;; foot (inset-block-end:100%). Same layer either way.
   ".ck-account__menu[data-chrome=float]{position:absolute;inset-inline:0;top:calc(100% + var(--hig-spacing-1));z-index:40;min-inline-size:13rem;display:grid;gap:2px;padding:var(--hig-spacing-2);border:1px solid var(--hig-color-separator);border-radius:var(--hig-radius-md,12px);background:var(--hig-color-system-background);box-shadow:0 8px 24px rgb(0 0 0 / 16%)}"
   ".ck-account__session:not([open]) .ck-account__menu{display:none}"
   ".ck-account__item{display:flex;align-items:center;min-height:2.5rem;padding:var(--hig-spacing-2) var(--hig-spacing-3);border-radius:var(--hig-radius-sm,8px);color:var(--hig-color-label);font:inherit;font-size:var(--hig-text-subheadline-font-size);font-weight:600;text-decoration:none;white-space:nowrap;background:none;border:none;cursor:pointer;inline-size:100%;text-align:start;box-sizing:border-box}"
   ".ck-account__item:hover{background:var(--hig-color-secondary-system-background)}"
   ".ck-account__item:focus-visible{outline:2px solid var(--hig-color-tint);outline-offset:-2px}"
   "@media(min-width:" rail-min-width "){.ck-account--rail .ck-account__menu[data-chrome=float]{top:auto;inset-block-end:calc(100% + var(--hig-spacing-1))}}"
   "@media(max-width:" rail-min-width "){.ck-account--rail .ck-account__menu[data-chrome=float]{inset-inline:auto 0}}"))

(defn topbar
  "The console top bar. `section` is the hiccup naming where the person is
   (navigation, not a second h1); `actions` the controls every view shares
   (chips, links, the language switch, the theme toggle). attrs go on the
   root; the data-chrome=top marker is not optional."
  [{:keys [section actions attrs]}]
  [:header (merge {:class "ck-topbar"} attrs {:data-chrome "top"})
   [:div {:class "ck-topbar__section"} section]
   (into [:div {:class "ck-topbar__actions"}] actions)])

(defn section-label
  "group › item, the breadcrumb-shaped section text of the top bar."
  [group item]
  [:span
   [:span {:class "ck-topbar__group"} group]
   [:span {:class "ck-topbar__sep" :aria-hidden "true"} "›"]
   [:span item]])

(defn- item-node [{:keys [href label id action attrs]}]
  (if href
    [:a (merge {:class "ck-account__item" :href href} attrs) label]
    [:button (merge {:type "button" :class "ck-account__item"}
                    (when id {:id id})
                    (when action {:data-ck-account action})
                    attrs)
     label]))

(defn account-entry
  "The account entry. Emits BOTH states:
     - signed-out: one sign-in control ({:href :label} under :sign-in);
     - session:    a <details> hidden until the host reveals it — the chip
                   (avatar initial / name / workspace, filled by
                   cloudKotobaShell.hydrateSession) and the floating menu of :items
                   ({:href :label} links or {:id :action :label} buttons).
   :variant :rail (the menu opens upward on the rail band) or :header.
   :menu-label is the chip's accessible name (accessible-name-required in
   contracts.edn :account-entry)."
  [{:keys [id variant sign-in menu-label items name workspace initial]
    :or {variant :rail}}]
  [:div {:class (str "ck-account" (when (= variant :rail) " ck-account--rail"))
         :id id :data-ck-account "entry"}
   [:a {:class "dads-button ck-account__sign-in" :data-type "outline" :data-size "sm"
        :href (:href sign-in) :data-ck-account "sign-in"}
    (:label sign-in)]
   [:details {:class "ck-account__session" :data-ck-account "session" :hidden true}
    [:summary {:class "ck-account__chip" :aria-label menu-label}
     [:span {:class "ck-account__avatar" :aria-hidden "true" :data-ck-account "initial"}
      (or initial (some-> name (subs 0 1) str/upper) "")]
     [:span {:class "ck-account__name"}
      [:span {:data-ck-account "name"} (or name "")]
      [:span {:class "ck-account__ws" :data-ck-account "workspace"} (or workspace "")]]
     [:span {:class "ck-account__caret" :aria-hidden "true"} "⌃"]]
    (into [:div {:class "ck-account__menu" :data-chrome "float" :role "group" :aria-label menu-label}]
          (map item-node items))]])

(def script
  "The shell's browser runtime, one JS string a host ships as its own file
   (script-src 'self' hosts cannot inline it). Exposes
   globalThis.cloudKotobaShell.hydrateSession(root, {name, workspace,
   initial}): fills the chip with the session's facts and reveals it (the
   sign-in control hides), wires the menu — Escape closes it and returns
   focus to the chip, a click outside closes it. The host keeps what
   sign-out does (listen on its button by id). Returns the root."
  (str
   "(function(global){'use strict';"
   "function hydrateSession(root,facts){"
   "if(!root)return null;facts=facts||{};"
   "const q=k=>root.querySelector('[data-ck-account=\"'+k+'\"]');"
   "const name=String(facts.name||'');"
   "const n=q('name');if(n)n.textContent='@'+name;"
   "const w=q('workspace');if(w)w.textContent=String(facts.workspace||'');"
   "const i=q('initial');if(i)i.textContent=facts.initial||name.slice(0,1).toUpperCase();"
   "const s=q('sign-in');if(s)s.hidden=true;"
   "const session=q('session');const chip=root.querySelector('.ck-account__chip');"
   "if(session){session.hidden=false;"
   "session.addEventListener('keydown',e=>{if(e.key==='Escape'&&session.open){session.open=false;if(chip)chip.focus();}});"
   "root.ownerDocument.addEventListener('click',e=>{if(session.open&&!session.contains(e.target))session.open=false;});}"
   "return root;}"
   "global.cloudKotobaShell=Object.freeze({hydrateSession});"
   "})(globalThis);"))
