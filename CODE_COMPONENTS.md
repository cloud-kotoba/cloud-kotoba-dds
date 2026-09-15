# Code components (0.1.0)

`cloud-kotoba-dds.code` — the code block a person **reads, then copies**: a figure
with a language label, a copy action and a `<pre>` whose tokens are coloured
server-side. First host: kotoba.cloud/docs (every config block, the models page,
the two `kc-command` blocks on the apex).

Owner observation 2026-09-15 on kotoba.cloud/docs (Quickstart): the code area was
hard to read — one colour for everything; a block inverted against the page
(`background: label; color: system-background`, which on the dark theme is a bright
grey slab with a black border); the long curl line clipped at the block's right edge
with no sign it scrolls; nothing to copy with. Each is now a property of the pattern.

## No highlighter runtime

Tokens are coloured by a pure tokenizer (`code/tokenize`, a rule table per language)
at render time. Not highlight.js / Prism: a `script-src 'self'` host cannot load one,
and a document whose colours arrive with a runtime is not the document it claims to
be (shinkansen `:document` = one self-contained file). The tokenizer promises a
round trip — concatenating its tokens is the source verbatim — because the copy
control reads the DOM text.

Languages: `:bash` (aliases `:sh :shell :zsh :curl :console`; the first bare word
of a line and the one after `|` `;` `&&` is the command; `$VAR` inside `"…"` and a
JSON body inside `'{…}'` are tokenized too), `:json` (`//` and `#` comments accepted —
the docs write JSONC), `:clojure` (`:clj :cljs :cljc :cljk :edn :kotoba`), `:http`
(status lines, methods, header names), `:text` (no colours). Unknown → `:text`.

## Colours, measured

The syntax colours are DADS ramp steps on `.ck-code` as `--ck-code-*` custom
properties (override them there; never restyle `.ck-tok-*`). Each was chosen for
AA contrast on **both** surfaces the block sits on and follows jp-go-dds.dark's
primitive mirror, so there is no second palette:

| token | light (gray-50 #f2f2f2) | dark (gray-900 #1a1a1a) |
|---|---|---|
| comment · gray-600 / -300 | 5.13 | 8.30 |
| string · green-900 / -300 | 7.39 | 8.41 |
| key · key-900 / -300 | 9.91 | 8.76 |
| var · purple-800 / -400 | 8.25 | 6.65 |
| flag · orange-900 / -300 | 5.45 | 9.06 |
| number · cyan-900 / -300 | 5.21 | 11.58 |
| literal · magenta-800 / -400 | 5.70 | 6.60 |

(The bridge's `--hig-palette-green` = green-700 measures 3.84 on the light surface —
that is why the fallback is not the value.) `test/code.mjs` measures the computed
colours in a browser, on both themes, and falls below 4.5.

## API

```clojure
(require '[cloud-kotoba-dds.code :as code])

code/css       ; token-contract CSS — load after jp-go-dds tokens/bridge-css
code/script    ; the copy control's runtime, ONE JS string the host ships as
               ; its own file (script-src 'self' hosts cannot inline it)

(code/block {:lang :bash                ; :bash :json :clojure :http :text (+ aliases)
             :title "Terminal"          ; caption; defaults to the language's label
             :wrap? true                ; default: long lines wrap. false → scrolls sideways, tabindex=0
             :copy? true                ; default: emit the copy control (hidden until the runtime reveals it)
             :copy-label "コピー" :copied-label "コピーしました"
             :id "quickstart-1"}
            source-string)

(code/inline "kc_pat_<your-token>")     ; [:code.ck-code-inline …]
```

`block` emits

```html
<figure class="ck-code" data-lang="bash" data-wrap>
  <figcaption class="ck-code__bar"><span class="ck-code__lang">Shell</span>
    <button … data-ck-code="copy" data-copied="Copied" aria-live="polite" hidden>Copy</button></figcaption>
  <pre data-lang="bash"><code class="language-bash">…tokens…</code></pre>
</figure>
```

`data-lang` on the `<pre>` and `language-<x>` on the `<code>` are the markers of
shinkansen.audit's `:code-language` axis; `.ck-code pre{overflow-x:auto}` and
`.ck-code[data-wrap] pre{white-space:pre-wrap}` are what `:pre-overflow` measures.

**Wrap is the default** because the measured failure was a clipped line, and the
copy control keeps the unbroken text. Ask for `:wrap? false` for a block whose
columns carry meaning (tables, diffs); it then scrolls and is keyboard-focusable.

The copy control is emitted `hidden` and revealed by `cloudKotobaCode.enhance()`
only where the page can write the clipboard — a host that ships no script shows no
dead control. On click it copies the `<pre>`'s text, shows `data-copied` for a
moment (announced via `aria-live`) and restores the label.

## Verification

`examples/code.html` is generated from `examples/code.cljk` (kbb, SCI backend, the
sibling classpath; `JP_GO_DDS` = the jp-go-dds checkout for the vendored palette).
`node test/code.mjs` drives it in a real browser at 390 and 1440, light and dark:
the page never overflows sideways; the wrapping block's `scrollWidth ≤ clientWidth`
(nothing clipped); the scrolling block scrolls and carries `tabindex=0`; every token
class is a colour different from plain text and reads at ≥ 4.5:1 on the block's
surface; the copy control is revealed, the clipboard holds the block's verbatim text
(the `-d '{…}'` line included), the label says Copied and is restored. Shown to fall
on a copy without the wrap rule ("the default block wraps (white-space pre)") and on
a copy using the bridge green ("`.ck-tok-string rgb(29, 139, 86)` on
`rgb(242, 242, 242)` reads at 3.84:1 — below AA 4.5").
