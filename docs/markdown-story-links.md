# Jump vs. Call, and markdown images/links in narration text

This page covers two things:

1. The difference between `narration.jump` and `narration.call`, since it explains *why*
   the new markdown link component behaves the way it does.
2. How to use the new `MarkdownImage` and `MarkdownLink` components, and the
   `requireLinkClickToContinue` utility, in your own labels.

## Jump vs. Call: a new page vs. a new paragraph

pixi-vn organizes narration history into **pages** and **paragraphs**:

- **`narration.jump(label, props)`** replaces the currently running label in the history
  with the target label. It starts a brand new **page**: pixi-vn's own docs describe
  `currentLabelHistory` (the current page) as something that "starts over every time a
  jump is performed". There is no way back to the label you jumped from - it behaves like
  a `goto`, not a function call.
- **`narration.call(label, props)`** pushes the target label on top of the current one,
  like a subroutine call: it opens a new **paragraph** inside the *same* page (a new
  paragraph starts whenever the number of open labels changes), and when the called label
  finishes, control returns to the step right after the `call` in the caller.

In practice:

- Use **`call`** for a short digression that should return - a flashback, an aside, a
  reusable "describe the weather" label you call from many places (see
  `start_memory`/`second_part_omen` in `src/content/labels/`).
- Use **`jump`** for moving the story forward for good - ending a scene and starting the
  next one (see the `narration.jump("start_hall", props)` calls in
  `src/content/labels/start.label.ts`).

This is also why the new `MarkdownLink` component (below) always uses `jump`, never
`call`: clicking a link in the text is meant to *navigate* to another part of the story,
like following a link to another page - not a returning subroutine call.

## `MarkdownImage`: images from markdown, including pixi-vn asset aliases

`src/components/markdown-components.tsx` exports `MarkdownImage`, a react-markdown `img`
renderer built on top of the existing `Image` component
(`src/components/ui/image.tsx`, which wraps `@unpic/react`).

Write a normal markdown image in any narration text:

```ts
narration.dialogue = `Above the hearth hangs a painting: ![The keep in summer](background_main_menu)`;
```

The image `src` (here `background_main_menu`) is resolved exactly like anywhere else
images are shown in this template: if it matches a registered pixi-vn asset alias (see
`src/assets/index.ts` and `Assets.init`), it's resolved to that asset's real url via
`getPixiJSAsset`/`useImageSrc`; otherwise it's used as-is (a plain image url also works).

See the example in `src/content/labels/start.label.ts` (`start_hall` label).

## `MarkdownLink`: linking to a label

`MarkdownLink` renders a markdown link, e.g.:

```ts
narration.dialogue = { character: steward, text: `[Read the notice](notice_board)` };
```

If the link target (`notice_board` above) is the id of a registered label
(`RegisteredLabels.has(id)`), clicking it **jumps** to that label
(`useNarrationFunctions().jumpToLabel`) instead of behaving like a normal `<a>` tag. Any
other `href` (a real url) is rendered as a normal external link.

See the example in `src/content/labels/start.label.ts`: the steward's line pointing at
`notice_board`.

## Blocking "continue" until a required link is clicked

Sometimes a link isn't optional flavor - the player must follow it before the story can
continue (e.g. "read the notice before you can answer"). This is a **template-only**
mechanism (it isn't part of pixi-vn itself): a storage flag, checked by
`useNarrationFunctions().goNext` and `useQueryCanGoNext`, that blocks every way of
advancing the narration (tap/click, Space/Enter, skip, auto-play) while it's set.

To use it, call `requireLinkClickToContinue()` (from
`src/lib/utils/continue-lock-utility.ts`) in the same step that shows the required link:

```ts
import { requireLinkClickToContinue } from "@/lib/utils/continue-lock-utility";

() => {
    requireLinkClickToContinue();
    narration.dialogue = { character: steward, text: `[Read the notice](notice_board)` };
},
```

You don't need to clear the flag yourself: `MarkdownLink` calls `jumpToLabel`, which
clears the lock automatically before jumping - whether or not the link happened to be the
"required" one. If you need to check or clear it directly (e.g. from custom code), use
`isContinueLockedByLink()` / `clearLinkContinueLock()` from the same utility file.
