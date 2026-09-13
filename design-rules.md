# Design rules — intuitive, task-first UI

**`cloud-kotoba-dds` prioritizes the user's task and next action.** Apply this
rule when building or reviewing Kotoba product UI on the `jp-go-dds` foundation.
The Murakumo conversation screen is the accepted example: composing is primary;
accounting, model specifications and management are revealed when requested.
This adopts the design rule, not every feature of the broader design study.

- **Show one clear task and its next action.** Keep related controls together:
  for generation, put the input, model choice and send action in one composer.
  On phones, preserve this group, touch targets and keyboard/safe-area clearance.
- **Give each fact one home.** Do not repeat a title, logo, identity, connection
  state, balance or explanation in multiple regions. Do not list empty chats as
  history or repeat "New chat" in an empty header and an empty history entry.
- **Reveal secondary information on demand.** Put usage and fee breakdowns,
  underlying model details, storage information and history management in clearly
  named settings or details. Keep the selected model's short, meaningful name
  visible beside the input. Keep account access discoverable from every view.
- **Use familiar, concise labels.** Describe the user's action or the model's
  purpose. Avoid duplicate bilingual labels, protocol names, IDs and internal
  implementation terminology unless the user needs them for the current task.
- **Make normal readiness evident through the controls.** Do not fill the idle
  screen with slogans, instructional paragraphs or a persistent "Ready" notice.
  Keep real running states, failures and actionable recovery visible; do not
  fabricate progress or hide a failure in settings to make the screen cleaner.
- **Preserve informed decisions.** Show the applicable price before a paid action.
  Keep required consent explicit, concise and unchecked by default, with details
  available. Never trade away accessible names, focus feedback or error recovery
  to reduce visible text. Closing a sheet returns focus to a usable origin and
  preserves the draft and selection.

Review empty, populated, running, complete, failed and signed-in states at phone
and desktop sizes. Ask: can a person find the next action without reading an
explanation; is any fact repeated; can secondary details be found when needed?
Verify both the simplified main view and the disclosed controls. Do not hide
features without leaving an understandable route to them.

