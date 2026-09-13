# Conversation components — 0.3.0-alpha

Murakumo uses this package for its production conversation layout and message DOM. The original 0.2 study remains at `index.html`; the reusable API has a separate [minimal example](examples/chat.html), generated from [examples/chat.cljk](examples/chat.cljk).

## Dependency

Add `io.github.kotoba-lang/cloud-kotoba-dds` to `deps.edn` with the Git SHA of the version you have verified. A coordinated west checkout can instead use `{:local/root "../cloud-kotoba-dds"}`. Source is portable Hiccup in `.cljk`; the existing kbb toolchain resolves it. The component namespaces have no external runtime dependencies. Load the `jp-go-dds` token bridge before `styles/css`.

```clojure
(require '[cloud-kotoba-dds.chat :as chat]
         '[cloud-kotoba-dds.styles :as styles]
         '[cloud-kotoba-dds.browser :as browser])

(chat/workspace {}
  (chat/sidebar {:aria-label "Conversations"} new-chat-button history settings-button)
  (chat/panel {:aria-label "Conversation"}
    (chat/toolbar {} conversation-title)
    (chat/conversation {}
      (chat/welcome {} [:h1 "What would you like to make?"])
      (chat/message-list {:id "messages" :aria-label "Messages"}))
    (chat/composer {:id "composer"}
      [:label {:for "input"} "Message"]
      (chat/prompt {:id "input" :required true})
      (chat/composer-actions {}
        (chat/model-control {}
          (chat/model-select {:aria-label "Model"} model-options))
        send-button))))
```

`model-options` is a vector of `{:id "model-id" :label "Short label" :disabled? false}`. Components accept attributes and child slots; the host supplies unique IDs, accessible labels, buttons and event bindings. They add stable component classes and `data-ck-chat` hooks. `chat/part` adds a named hook to host-owned elements when needed. Do not recreate the styles in each service.

The workspace height defaults to the viewport minus the host header. A headerless or embedded host can set its own height on `chat/workspace`, as the example does. Put the composer last in the panel and preserve the panel's flex layout. Sidebar open/close state, native settings dialogs, focus restoration and routes belong to the host adapter in this initial API.

## Browser adapter

Include `browser/script` once in the document before your application script. It exposes a stateless renderer:

```js
const view = cloudKotobaChat.createMessage({
  container: document.querySelector('#messages'),
  input: userText,
  userLabel: 'You',
  role: selectedModelLabel,
  stages: [{id: 'working', label: 'Generating'}]
});
view.output.textContent = partialAnswer; // update from real streaming events
view.live.textContent = 'Generating';
// Complete: render a validated image/video or text into view.output.
view.steps.hidden = true;
view.live.textContent = 'Complete';
```

The returned handles are `answer`, `steps`, `live`, `output` and `actions`. Input and labels are inserted as text, never HTML. Each call uses the supplied container's document and keeps no current-conversation singleton. Multiple instances are independent. Never insert untrusted HTML or unvalidated media URLs into the returned elements.

## Host responsibilities

The package does not fetch models, retain conversations, authenticate users, calculate charges or grant publication consent. Hosts supply these adapters and own authorization, data lifecycle and verified usage receipts. Consent is an optional composer slot, not a prechecked or mandatory library policy. Progress labels and events come from the real backend; the library does not invent percentages or hidden model steps.

The initial API shares rendering and layout. It does not claim a universal conversation store, a React/re-frame controller, or every interaction from the older study. Maintain accessible labels, IME-safe input, focus return, cancellation semantics and visible recovery in each adapter.

## Checks

Serve the repository and open `examples/chat.html` to try the fixture without a compiler or backend. To regenerate it, resolve the dependencies in the `:example` alias and run `examples/chat.cljk` with kbb's SCI backend and that resolved classpath.

With Playwright installed, run `node test/chat-components.mjs` (`BROWSER_CHANNEL=chrome` may be used). It checks 320/390/768/1440 widths, composer use, safe text rendering and independent instances. Murakumo's integration suite additionally checks streaming, model switching, images, video, history, consent and account separation.
