# Checkpoint MVP — Architecture and Tooling Implementation Doc

## Goal

Build a 24-hour MVP that proves one loop:

1. capture a checkpoint quickly
2. reopen the task later
3. recover enough context to continue work

The MVP should optimize for speed, low implementation risk, and a believable demo.

---

## Recommended Stack

* **Electron**
* **TypeScript**
* **React**
* **Vite**
* **Local JSON file storage**
* **LLM API** for:

  * task title suggestion
  * resume snapshot generation

---

## Architecture

### 1. Main Process

The main process owns all desktop and data behavior.

**Responsibilities**

* register global shortcut
* create/show/hide windows
* read clipboard text
* load/save local data
* call the LLM API
* mark resume snapshots stale or fresh

**Rule**
Keep all privileged logic here.

---

### 2. Preload Layer

Expose a very small typed API to the renderer.

**Expose only**

* `saveCheckpoint`
* `createTask`
* `listRecentTasks`
* `getTask`
* `openTask`
* `readClipboard`
* `refreshSnapshot`
* `deleteTask`

Do not expose raw Node APIs to the renderer.

---

### 3. Renderer

Use React for a very small UI.

**Screens**

* capture overlay
* recent tasks list
* task view

Do not add router/state libraries unless absolutely necessary.

Use simple local React state.

---

## Product Surfaces

### Capture Overlay

Contains:

* short text input
* attach clipboard button
* save to current task
* create new task

### Main App

Contains:

* recent tasks list
* task detail view

### Task Detail View

Contains:

* task title
* snapshot status
* latest resume snapshot
* recent raw checkpoints
* full raw checkpoint timeline

---

## Storage

Use a single local JSON file.

### Suggested Data Model

```ts
type Task = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lastOpenedAt?: string
  snapshot?: {
    text: string
    generatedAt: string
    basedOnLastCheckpointId: string
  }
}

type Checkpoint = {
  id: string
  taskId: string
  timestamp: string
  typedText?: string
  clipboardText?: string
}
```

---

## AI Behavior

AI is optional support, not core app logic.

### AI Functions

* `suggestTitle(checkpointText)`
* `generateResumeSnapshot(recentCheckpoints)`

### Rules

* never block checkpoint save on AI
* never block task open on AI
* always show raw checkpoints immediately
* use fallback title if title generation fails
* show cached snapshot if present
* refresh snapshot asynchronously

### Snapshot Scope

Use only the most recent few checkpoints.

Do not summarize the full task history.

---

## Window Model

Use two windows.

### 1. Overlay Window

* small
* hidden by default
* shown by global shortcut
* used only for fast capture

### 2. Main Window

* recent tasks
* task detail
* normal app navigation

Do not try to make the overlay complex.

---

## Suggested File Structure

```text
src/
  main/
    main.ts
    windows.ts
    ipc.ts
    storage.ts
    ai.ts
    models.ts
  preload/
    preload.ts
  renderer/
    App.tsx
    CaptureOverlay.tsx
    RecentTasks.tsx
    TaskView.tsx
    api.ts
    types.ts
```

---

## IPC Contract

Keep IPC minimal and explicit.

### Suggested methods

* `task:create`
* `task:listRecent`
* `task:get`
* `task:open`
* `task:delete`
* `checkpoint:save`
* `clipboard:read`
* `snapshot:refresh`

That is enough for the MVP.

---

## Freshness Model

Keep this very simple.

A snapshot is:

* **fresh** if it is based on the latest checkpoint
* **stale** if newer checkpoints exist

Do not build complex trust or confidence UI.

---

## Features to Keep

* global shortcut
* fast overlay
* typed checkpoint note
* optional clipboard text
* save to current task
* create new task
* recent tasks list
* raw checkpoint timeline
* async task title generation
* async resume snapshot generation
* stale/fresh snapshot status

---

## Features to Cut

Do not build these in the 24-hour MVP:

* SQLite
* search
* sync
* export
* screenshots
* voice
* passive/background capture
* automatic task assignment
* task branching
* collaboration
* generalized AI chat
* rich trust indicators
* complex structured summaries
* analytics
* auto-update
* routing/state management infrastructure
* design system/component library unless already set up

Optional cut if time gets tight:

* checkpoint deletion
* task title editing

---

## Implementation Order

Build in this order:

1. Electron app shell
2. main window
3. overlay window
4. global shortcut
5. local JSON persistence
6. create task / save checkpoint
7. recent tasks list
8. task detail with raw checkpoints
9. title generation
10. snapshot generation
11. stale/fresh badge
12. cleanup and demo polish

---

## Success Criteria

The MVP is done when a user can:

* hit a shortcut
* type a quick checkpoint
* optionally attach clipboard text
* save in a few seconds
* reopen the task later
* immediately see raw history
* understand likely next step within about 10 seconds