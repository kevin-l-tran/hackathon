# Checkpoint — Revised MVP Product Specification

## 1. Document Status

**Product:** Checkpoint  
**Document Type:** MVP Product Specification  
**Version:** 1.1  
**Scope:** Revised essential MVP only

---

## 2. Product Summary

### 2.1 Goal

Checkpoint helps technical users resume interrupted desktop work without reconstructing task state from scratch.

### 2.2 Core Job to Be Done

When a user is interrupted during technical work, Checkpoint should help them later answer within seconds:

1. What was I doing?
2. What did I already check?
3. What should I do next?

### 2.3 MVP Definition

A user can save a checkpoint in a few seconds and later reopen the task to see a conservative resume snapshot backed by recent raw checkpoints.

---

## 3. Problem Statement

Interruptions during technical work are costly because users lose fragile working state, not just facts.

The product is intended to preserve enough state to resume debugging, implementation, analysis, or technical reasoning without rebuilding context from memory.

Checkpoint is not a note-taking app, task manager, or general assistant. Its purpose is interruption recovery.

---

## 4. Target User

### 4.1 Primary User

A technical desktop user working on a cognitively heavy task such as debugging, implementation, or analysis.

### 4.2 MVP User Profile

The MVP is designed for users whose work depends on preserving short-lived reasoning state across code, terminals, logs, browser tabs, and copied technical artifacts.

---

## 5. Product Principles

1. **Capture must be faster than forgetting.**
2. **Resume is the product.**
3. **Raw history is the source of truth.**
4. **The system should infer conservatively.**
5. **Privacy is a product requirement.**
6. **Capture and resume must not block on AI.**

Checkpoint should help the user restart action, not generate polished notes or over-structured summaries.

---

## 6. Essential MVP Scope

### 6.1 Included

- Desktop application
- Global shortcut to open quick capture
- Create a new task
- Save a checkpoint to the current task
- Typed checkpoint note
- Optional clipboard text attachment
- AI-inferred task title with fallback title when needed
- Local storage by default
- Recent task list
- Task view with:
  - task title
  - conservative resume snapshot
  - recent raw checkpoints
  - full raw checkpoint timeline
- Delete task
- Delete checkpoint

### 6.2 Excluded

- Screenshots
- Voice input
- Transcription
- Automatic task assignment
- Task branching
- Collaboration
- External integrations
- Search
- Export
- Sync
- Dashboards
- Generalized AI chat
- Background activity capture
- Deep IDE integration
- Confidence scores
- Complex reasoning visualizations
- Rich semantic task state beyond the raw checkpoint history and a lightweight resume snapshot

---

## 7. Core Workflow

### 7.1 Capture

1. The user triggers a global shortcut.
2. A lightweight capture overlay opens immediately.
3. The user enters a short checkpoint note.
4. The user may attach clipboard text.
5. The user saves to the current task or creates a new task.
6. The system stores the raw checkpoint immediately.
7. If a new task is created, the system assigns an AI-suggested title when possible, or a safe fallback title if not.

### 7.2 Resume

1. The user opens the application.
2. The application shows recent tasks, with the current task first when one exists.
3. The user opens a task.
4. The application immediately shows:
   - task title,
   - recent raw checkpoints,
   - full raw timeline,
   - the latest cached resume snapshot when one exists.
5. The system generates or refreshes the resume snapshot on open without blocking access to raw history.

This capture-and-resume loop is the product.

---

## 8. Core Product Surfaces

### 8.1 Capture Overlay

**Purpose:** Fastest possible capture.

**Required:**
- Short text input
- Optional clipboard attachment
- Save to current task
- Create new task

**Not required:**
- Manual title entry during capture
- Forms
- Tagging
- Required categorization
- Summary editing during capture

### 8.2 Task View

**Purpose:** Fastest possible resumption.

**Required:**
- Task title
- Conservative resume snapshot
- Freshness status for the snapshot
- Recent raw checkpoints
- Full raw timeline

### 8.3 Recent Tasks List

**Purpose:** Reopen work by recency.

**Required:**
- Current task, if one exists
- Recently updated tasks

A separate history or dashboard view is not required for the MVP.

---

## 9. Input Model

A checkpoint is the core unit of input.

Each checkpoint may contain:
- Typed text
- Clipboard text
- Or both

Typed text is the primary input. Clipboard attachment is optional. Screenshot and voice input are out of scope for the MVP.

---

## 10. Task Model

### 10.1 MVP Rules

1. Only one task is current at a time.
2. New checkpoints save to the current task by default.
3. The user can create a new task from the capture overlay.
4. Opening a task makes it the current task.
5. The system does not auto-reassign checkpoints.
6. New tasks receive an AI-suggested title by default.
7. Title generation must never block checkpoint saving.
8. Task titles are editable later in the task view.

These rules keep task behavior explicit and predictable while reducing capture overhead.

### 10.2 Title Rules

- The system should infer a concise task title from the checkpoint text when possible.
- Titles should describe the work narrowly and concretely.
- If title inference fails or is weak, the system should use a fallback title such as `Untitled task — Apr 15, 3:42 PM`.
- Users should not be required to think about naming during interruption.

---

## 11. Data Model

### 11.1 Task

- `task_id`
- `title`
- `created_at`
- `updated_at`
- `last_opened_at`

### 11.2 Checkpoint

- `checkpoint_id`
- `task_id`
- `timestamp`
- `typed_text`
- `clipboard_text`

### 11.3 Derived Resume State

For each task, the system may store:
- `snapshot_text`
- `generated_at`
- `based_on_last_checkpoint_id`
- `is_outdated`

Raw checkpoints are the source of truth. Derived state exists only to support resumption.

---

## 12. AI Role in MVP

AI is optional support for resume, not the product itself.

### 12.1 AI Should Do

- Suggest a task title for new tasks
- Generate a conservative resume snapshot from recent checkpoints
- Suggest a likely next step only when supported by recent evidence
- Summarize recent checked paths or evidence only when clearly supported

### 12.2 AI Should Not Do

- Auto-assign checkpoints to different tasks
- Merge tasks
- Create branches
- Replace raw history
- Hide contradictions
- Over-compress technical detail
- Infer more structure than required for resumption
- Build a complex semantic model of the task

### 12.3 Failure Behavior

If AI fails or produces weak output:
- Raw checkpoint saving must still work
- The task must remain usable
- The user must still be able to resume from raw history
- Capture must never be blocked
- Task opening must never be blocked

---

## 13. Resume Requirements

The resume view must help the user answer:

1. What is this task?
2. What should I do next?
3. What have I already checked?

### 13.1 Resume Layout

1. Task title
2. Resume snapshot
3. Snapshot freshness and status
4. Recent raw checkpoints
5. Full raw timeline

Recent raw checkpoints should appear directly below the resume snapshot so the user can verify the system’s interpretation quickly.

### 13.2 Resume Snapshot Rules

The resume snapshot should be lightweight and conservative.

It may include short sections such as:
- **Likely objective**
- **Likely next step**
- **Recent evidence**

These sections are optional and should appear only when they are supported by recent checkpoints.

The system should prefer a short, useful snapshot over a richer but less reliable structure.

### 13.3 Timing Rules

- Resume snapshot generation should happen on task open.
- The task view must load without waiting for summary generation.
- When a cached snapshot exists, it may be shown immediately and refreshed in place.
- When new checkpoints exist that are not reflected in the cached snapshot, the UI should mark the snapshot as stale until refreshed.

---

## 14. Trust Requirements

- Raw checkpoints remain visible in chronological order
- New checkpoints may weaken prior ideas without deleting them
- The resume snapshot may emphasize the most recent state but must not erase prior raw inputs
- Uncertain statements must be presented as tentative
- Contradictions should be surfaced explicitly rather than reconciled aggressively

Checkpoint should help the user think again, not pretend the problem has already been solved.

### 14.1 Trust UI Rules

- The system should use tentative labels such as **Likely objective** and **Likely next step** rather than definitive labels.
- The task view should show freshness metadata such as:
  - when the snapshot was last updated,
  - how many recent checkpoints it used,
  - whether newer checkpoints exist.
- When recent checkpoints conflict, the UI should say so plainly and keep the relevant raw checkpoints visible directly below the snapshot.

The MVP should rely on wording and freshness cues, not confidence scores or complex trust indicators.

---

## 15. Privacy and Storage

### 15.1 MVP Requirements

- Local storage only
- Clear explanation of what is stored
- No hidden sharing
- Delete task
- Delete checkpoint
- No training on user data without explicit opt-in

Because users may capture proprietary code, logs, and research notes, privacy is a core product requirement.

---

## 16. Performance Requirements

### 16.1 Capture

- The capture overlay should open immediately
- Typing should feel responsive with no noticeable lag
- Save should feel instant
- Clipboard attachment should be a single lightweight action
- The capture flow should feel lighter than opening a notes application

### 16.2 Resume

- Opening a task should not depend on heavy processing
- Raw checkpoints should always be accessible even if resume snapshot generation is slow or unavailable
- Cached resume snapshots may be shown immediately and refreshed in place

### 16.3 Time-to-Capture Target

Checkpoint should support a normal capture flow in about 10 seconds.

A user should be able to:
1. trigger capture,
2. type a short note,
3. optionally paste one or two evidence snippets,
4. save,
within about 10 seconds without delays.

Fast-note captures should often be possible in under 5 seconds.

Low friction matters more than feature breadth.

---

## 17. Validation Goal

The MVP is intended to answer one question:

**Does this help a technical user get back into interrupted work faster?**

### 17.1 Early Success Signals

- Users create checkpoints repeatedly
- Users reopen recent tasks to resume work
- Users report that they knew what to do next quickly
- Users trust the raw history because the resume snapshot remains conservative
- Users do not feel forced to organize tasks during interruption

### 17.2 Early Failure Signals

- Users frequently disagree with the resume snapshot
- Users stop using capture because it feels like overhead
- Users feel that title creation or evidence attachment slows them down
- Users ignore the snapshot and rely only on raw history because the synthesis is not useful

---

## 18. Release Criterion

The MVP is ready for live testing when a user can:

1. Create a checkpoint in a few seconds
2. Save typed text and optionally clipboard text
3. Create a new task without manual title entry
4. Reopen a recent task
5. See raw checkpoints immediately on open
6. Understand the task and likely next step within about 10 seconds
7. Inspect recent raw checkpoints and the full raw timeline
8. Feel that the product reduced reconstruction effort after interruption

---

## 19. Non-Goals

Do not add the following unless the core loop fails without them:

- Integrations
- Sync
- Search
- Screenshots
- Voice
- Branching
- Collaboration
- Dashboards
- Generalized AI assistance
- Passive capture
- Deep IDE features
- Rich structured summaries beyond a lightweight resume snapshot
- Persistent semantic task graphs or advanced state inference

---

## 20. Summary

The revised essential MVP exists to validate one loop only:

1. Capture quickly
2. Return later
3. Resume quickly

The product should optimize for low-friction capture, trustworthy raw history, and a lightweight resume snapshot that helps the user restart work without pretending to replace their original reasoning.

Any feature that does not materially improve that loop should remain out of scope until the MVP is validated.
