## Estimated implementation checklist

### 1) App shell and project setup — **1.5 to 2.5 hours**

* [X] Create Electron + TypeScript + React + Vite project
* [X] Set up `main`, `preload`, and `renderer` folders
* [X] Create overlay window and main window
* [X] Confirm privileged logic stays in main process

**Time notes:** fast if you use a starter; slower if Electron packaging/config fights you.  

### 2) Local data layer — **1 to 1.5 hours**

* [X] Create local JSON storage file
* [X] Define `Task` and `Checkpoint` models
* [X] Add read/write helpers
* [X] Handle first-run empty state
* [X] Update timestamps correctly

**Time notes:** keep this dead simple; one JSON file is the right hackathon choice. 

### 3) IPC and preload API — **1 to 1.5 hours**

* [X] Implement minimal IPC contract
* [X] Expose only the typed methods you need
* [X] Keep renderer free of raw Node access

**Time notes:** worth doing cleanly once so you do not fight structure later.  

### 4) Global shortcut and overlay — **1.5 to 2 hours**

* [X] Register global shortcut
* [X] Open overlay instantly
* [ ] Add short text input
* [ ] Add attach clipboard button
* [ ] Add save to current task / create new task
* [ ] Hide overlay after save

**Time notes:** this is core demo value, so do it early.  

### 5) Core task behavior — **45 to 75 minutes**

* [ ] Support one current task
* [ ] Save new checkpoints to current task by default
* [ ] Opening a task makes it current
* [ ] Allow creating a new task from overlay

**Time notes:** simple rules reduce edge cases. 

### 6) Checkpoint creation flow — **1 to 1.5 hours**

* [ ] Save typed text
* [ ] Save optional clipboard text
* [ ] Save raw checkpoint immediately
* [ ] Never block save on AI

**Time notes:** this should feel instant even before AI exists.  

### 7) Recent tasks list — **1 to 1.5 hours**

* [ ] Build recent tasks list
* [ ] Sort by recency
* [ ] Show current task first if present
* [ ] Handle empty state

**Time notes:** basic UI only; no search/filter. 

### 8) Task detail view with raw history — **2 to 3 hours**

* [ ] Show task title
* [ ] Show recent raw checkpoints
* [ ] Show full timeline
* [ ] Make raw history visible immediately on open

**Time notes:** this is the real fallback if AI is weak, so make it solid.  

### 9) Snapshot freshness logic — **30 to 60 minutes**

* [ ] Store `basedOnLastCheckpointId`
* [ ] Mark fresh vs stale
* [ ] Show simple badge/status

**Time notes:** easy win; do not overbuild trust UI.  

### 10) AI title generation — **45 to 90 minutes**

* [ ] Add `suggestTitle(checkpointText)`
* [ ] Trigger only for new tasks
* [ ] Use fallback title on failure
* [ ] Never block save

**Time notes:** useful polish, but not required for the core loop to function.  

### 11) AI resume snapshot generation — **1.5 to 2.5 hours**

* [ ] Add `generateResumeSnapshot(recentCheckpoints)`
* [ ] Use only recent checkpoints
* [ ] Show cached snapshot immediately
* [ ] Refresh on task open asynchronously
* [ ] Keep wording tentative and conservative

**Time notes:** this can expand if you overthink prompts. Keep it short.  

### 12) Privacy and deletion — **45 to 90 minutes**

* [ ] Keep storage local only
* [ ] Add delete task
* [ ] Add delete checkpoint if time allows
* [ ] Make storage behavior clear

**Time notes:** task delete is likely enough for demo; checkpoint delete is optional. 

### 13) Demo polish and bug fixing — **2 to 4 hours**

* [ ] Tighten spacing and readability
* [ ] Improve keyboard flow
* [ ] Seed believable example tasks
* [ ] Test capture -> reopen -> resume end to end
* [ ] Prepare demo script

**Time notes:** this always takes longer than expected. Protect time for it.  

## Total expected time

### Bare-minimum functional MVP

**10 to 13 hours**

* App shell
* JSON storage
* IPC/preload
* Shortcut + overlay
* Create task / save checkpoint
* Recent tasks
* Task view with raw history

### Strong demoable MVP

**14 to 18 hours**

* Everything above
* AI title generation
* AI snapshot generation
* Fresh/stale status
* Some polish

### Full hackathon stretch

**19 to 24 hours**

* Everything above
* Delete task
* Delete checkpoint
* Extra UX cleanup
* Better empty/error states
* Packaging/demo prep

## Best order with time boxes

### Phase 1: get the loop working — **6 to 8 hours**

* [ ] App shell
* [ ] Two windows
* [ ] Global shortcut
* [ ] JSON persistence
* [ ] Create task / save checkpoint

### Phase 2: make resume usable — **3 to 5 hours**

* [ ] Recent tasks list
* [ ] Task detail
* [ ] Raw checkpoint timeline
* [ ] Current task behavior

### Phase 3: add AI carefully — **2.5 to 4 hours**

* [ ] Title generation
* [ ] Resume snapshot
* [ ] Fresh/stale logic

### Phase 4: protect the demo — **2 to 4 hours**

* [ ] Bug fixing
* [ ] Empty states
* [ ] Deletion
* [ ] Demo script and seeded data

## Practical cut rules

If you are behind schedule:

* Cut checkpoint deletion first
* Cut title editing
* Keep AI prompts extremely simple
* Keep styling minimal
* Never cut raw checkpoint history, fast capture, or reopen flow  

## Simple deadline version

Use this as your personal tracking bar:

* **Hour 6:** shortcut + overlay + save checkpoint works
* **Hour 10:** recent tasks + task view + raw history works
* **Hour 14:** AI title + AI snapshot work
* **Hour 18:** stale/fresh + deletion + polish
* **Hour 22+:** bug fixing and demo only