# Checkpoint — ASCII UI Samples (Merged Main View)

This document rewrites the earlier ASCII mockups around a simpler MVP structure:

1. capture overlay
2. main app opening directly into the current task / resume view
3. lightweight task switching inside the main app rather than a separate recent-tasks page

These are structural references, not pixel-perfect specs.

---

## Notes

- The main app should open directly into the current task when one exists.
- A separate recent-tasks landing page is not required.
- Task switching should be embedded as a sidebar, drawer, or compact switcher.
- Creating a task should happen from the same capture overlay used for normal checkpoints.
- Raw checkpoints remain the source of truth.
- The resume snapshot should be helpful, conservative, and easy to verify.

---

# 1. Capture Overlay

## A. Default capture overlay for current task

```text
+------------------------------------------------------------------+
| Checkpoint                                                Esc  X |
| Save a quick note for later                                      |
|                                                                  |
| Current task: Fix parser bug                                     |
|                                                                  |
| +--------------------------------------------------------------+ |
| | What were you doing / what should happen next?               | |
| |                                                              | |
| | Investigate why nested array parsing fails after delimiter...| |
| |                                                              | |
| +--------------------------------------------------------------+ |
|                                                                  |
| [Attach clipboard]   No clipboard attached                       |
|                                                                  |
| [Save checkpoint]                      [Start new task]          |
+------------------------------------------------------------------+
```

### Use when
- the user already has an active task
- checkpoint capture should be a single fast action

### Emphasis
- the note field dominates
- current task is visible but secondary
- task creation is a secondary action, not a separate mode

---

## B. Capture overlay with clipboard attached

```text
+-------------------------------------------------------------------+
| Checkpoint                                                 Esc  X |
| Save a quick note for later                                       |
|                                                                   |
| Current task: Fix parser bug                                      |
|                                                                   |
| +---------------------------------------------------------------+ |
| | Tried parser fix in parseNode(); still fails on nested arrays | |
| | Next: compare token stream before recursion branch            | |
| +---------------------------------------------------------------+ |
|                                                                   |
| [Clipboard attached]                                              |
| +---------------------------------------------------------------+ |
| | TypeError: cannot read properties of undefined                | |
| | at parseNode (parser.ts:184:17)                               | |
| | ...                                                           | |
| +---------------------------------------------------------------+ |
|                                                                   |
| [Remove clipboard]                      [Collapse preview]        |
|                                                                   |
| [Save checkpoint]                      [Start new task]           |
+-------------------------------------------------------------------+
```

### Use when
- clipboard text is part of the checkpoint evidence
- the user wants lightweight confirmation before saving

### Emphasis
- clipboard stays visible but secondary to the typed checkpoint

---

## C. New-task creation state inside the same overlay

```text
+-------------------------------------------------------------------+
| Checkpoint                                                 Esc  X |
| This checkpoint will start a new task                             |
|                                                                   |
| +---------------------------------------------------------------+ |
| | Reproduce timeout in evaluation worker; logs suggest queue    | |
| | starvation after retry burst                                  | |
| +---------------------------------------------------------------+ |
|                                                                   |
| [Attach clipboard]   Clipboard ready                              |
|                                                                   |
| Title: suggested automatically after save                         |
| Fallback: Untitled task - Apr 18, 3:42 PM                         |
|                                                                   |
| [Save to current task]                  [Create new task]         |
+-------------------------------------------------------------------+
```

### Use when
- the user decides this checkpoint belongs to new work
- you want task creation to be explicit without needing a second form

### Emphasis
- no manual naming burden during interruption
- same layout and input flow as normal checkpoint capture

---

## D. Minimal fast-note overlay

```text
+--------------------------------------------------------------+
| Checkpoint                                             Esc X |
|                                                              |
| Current task: Fix parser bug                                 |
|                                                              |
| +----------------------------------------------------------+ |
| | lexer output looks correct; inspect parseNode next       | |
| +----------------------------------------------------------+ |
|                                                              |
| [Attach clipboard]                                           |
|                                                              |
| [Save]                                  [New task]           |
+--------------------------------------------------------------+
```

### Use when
- you want the smallest possible MVP overlay
- speed matters more than context display

---

# 2. Main App — Task / Resume View

## A. Empty state with no tasks yet

```text
+--------------------------------------------------------------------------------+
| Checkpoint                                                      [New capture]  |
+--------------------------------------------------------------------------------+
|                                                                                |
|  No tasks yet                                                                  |
|                                                                                |
|  Create your first checkpoint to start building resumable context.             |
|                                                                                |
|  [Create first checkpoint]                                                     |
|                                                                                |
+--------------------------------------------------------------------------------+
```

### Use when
- first run
- there is no current task yet

### Emphasis
- no fake dashboard content
- main action leads directly into capture

---

## B. Canonical main view with embedded task switcher rail

```text
+--------------------------------------------------------------------------------+
| Checkpoint                                                      [New capture]  |
+--------------------------+-----------------------------------------------------+
| Tasks                    | Fix parser bug                                      |
|                          | Updated today at 3:42 PM                            |
| > Fix parser bug         |                                                     |
|   8m ago                 | +-------------------------------------------------+ |
|                          | | Resume snapshot                      Fresh      | |
|   Resume eval flow       | | Updated 1m ago • based on 3 checkpoints         | |
|   42m ago                | |                                                 | |
|                          | | Likely objective                                | |
|   Investigate timeout    | | Resolve why valid nested input is rejected.     | |
|   yesterday              | |                                                 | |
|                          | | Likely next step                                | |
|   Query planner notes    | | Compare the failing sample against the          | |
|   2d ago                 | | recursive descent branch in parseNode().        | |
|                          | |                                                 | |
|                          | | Recent evidence                                 | |
|                          | | - lexer output looked correct                   | |
|                          | | - delimiter fix did not resolve the failure     | |
|                          | +-------------------------------------------------+ |
|                          |                                                     |
|                          | Recent checkpoints                                  |
|                          | +-------------------------------------------------+ |
|                          | | 3:39 PM                                         | |
|                          | | Tried delimiter fix; still fails on nested      | |
|                          | | arrays. Clipboard attached.                     | |
|                          | +-------------------------------------------------+ |
|                          | +-------------------------------------------------+ |
|                          | | 3:31 PM                                         | |
|                          | | Lexer output looks correct for failing input.   | |
|                          | +-------------------------------------------------+ |
|                          |                                                     |
|                          | Full timeline                                       |
|                          | 3:05 PM  Task created                               |
|                          | 3:12 PM  First repro from config                    |
|                          | 3:31 PM  Lexer output looks correct                 |
|                          | 3:39 PM  Tried delimiter fix                        |
+--------------------------+-----------------------------------------------------+
```

### Use when
- you want the default main window layout
- task switching should stay visible but secondary to resume

### Emphasis
- the resume view is the page
- the task list is now just navigation
- raw checkpoints remain directly below the snapshot

---

## C. One-column main view with compact task switcher

```text
+---------------------------------------------------------------------------------+
| Checkpoint                                   Fix parser bug      [Switch] [New] |
|                                              Updated today at 3:42 PM           |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | Resume snapshot                                                   Fresh     | |
| | Updated 1m ago • based on 3 checkpoints                                     | |
| |                                                                             | |
| | Likely objective                                                            | |
| | Resolve why valid nested input is rejected.                                 | |
| |                                                                             | |
| | Likely next step                                                            | |
| | Compare the failing sample against the recursive descent branch.            | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| Recent checkpoints                                                              |
| +-----------------------------------------------------------------------------+ |
| | 3:39 PM  Tried delimiter fix; still fails on nested arrays.                | |
| |         Clipboard attached.                                                | |
| +-----------------------------------------------------------------------------+ |
| +-----------------------------------------------------------------------------+ |
| | 3:31 PM  Lexer output looks correct for failing input.                     | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| Timeline                                                                        |
| [3:05 PM] Task created                                                          |
| [3:12 PM] First repro from config                                               |
| [3:31 PM] Lexer output looks correct                                            |
| [3:39 PM] Tried delimiter fix                                                   |
|                                                                                 |
|                                           [Delete task] [Refresh snapshot]     |
+---------------------------------------------------------------------------------+
```

### Use when
- you want the simplest implementation first
- task switching can live behind a button, dropdown, or command palette

### Emphasis
- even less navigation chrome
- strongest focus on resume and evidence

---

## D. Main view with task switcher drawer open

```text
+--------------------------------------------------------------------------------+
| Checkpoint                                             Fix parser bug [New]    |
+--------------------------------------------------+-----------------------------+
| Switch task                                      | Fix parser bug              |
|                                                  | Updated today at 3:42 PM    |
| Search tasks...                                  |                             |
|                                                  | +-------------------------+ |
| > Fix parser bug                                 | | Resume snapshot   Fresh | |
|   8m ago                                         | | ...                     | |
|                                                  | +-------------------------+ |
|   Resume eval flow                               |                             |
|   42m ago                                        | Recent checkpoints          |
|                                                  | ...                         |
|   Investigate timeout                            |                             |
|   yesterday                                      | Timeline                    |
|                                                  | ...                         |
|   Query planner notes                            |                             |
|   2d ago                                         |                             |
|                                                  |                             |
+--------------------------------------------------+-----------------------------+
```

### Use when
- you want task switching to feel available without becoming the landing page
- you need more space for many tasks but still want resume on screen

### Emphasis
- switching tasks is temporary navigation, not the main product surface

---

## E. Task view with stale snapshot refreshing in place

```text
+--------------------------------------------------------------------------------+
| Checkpoint                                   Resume eval flow   [Switch] [New] |
|                                              Updated today at 4:08 PM          |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | Resume snapshot                                                  Stale     | |
| | Updated 18m ago • newer checkpoints exist • Refreshing...                  | |
| |                                                                            | |
| | Likely objective                                                           | |
| | Finish evaluation pass and compare regression output against baseline.     | |
| |                                                                            | |
| | Likely next step                                                           | |
| | Inspect why the newest run dropped recall on long-context samples.         | |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| Recent checkpoints                                                             |
| +----------------------------------------------------------------------------+ |
| | 4:08 PM  New run finished; long-context recall dropped.                   | |
| +----------------------------------------------------------------------------+ |
| +----------------------------------------------------------------------------+ |
| | 3:50 PM  Baseline metrics copied from previous run.                       | |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| Timeline                                                                       |
| ...                                                                            |
+--------------------------------------------------------------------------------+
```

### Use when
- snapshot generation is async
- raw history must remain usable immediately

---

## F. Task view with no snapshot yet

```text
+--------------------------------------------------------------------------------+
| Checkpoint                                  Investigate timeout  [Switch] [New] |
|                                              Updated today at 2:14 PM          |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | Resume snapshot                                                            | |
| | Generating summary...                                                      | |
| | Raw checkpoints are available below now.                                   | |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| Recent checkpoints                                                             |
| +----------------------------------------------------------------------------+ |
| | 2:14 PM  Timeout happens after retry burst. Queue size spikes but workers | |
| |         do not drain.                                                     | |
| +----------------------------------------------------------------------------+ |
| +----------------------------------------------------------------------------+ |
| | 2:07 PM  Logs copied from worker process.                                 | |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| Timeline                                                                       |
| [1:58 PM] Task created                                                         |
| [2:07 PM] Logs attached                                                        |
| [2:14 PM] Retry burst suspicion noted                                          |
+--------------------------------------------------------------------------------+
```

### Use when
- a task has just been opened
- you want honest non-blocking loading behavior

---

## G. Task view with conflicting recent checkpoints

```text
+--------------------------------------------------------------------------------+
| Checkpoint                                  Query planner notes [Switch] [New] |
|                                              Updated today at 5:03 PM          |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | Resume snapshot                                                  Fresh     | |
| | Updated 30s ago • based on 4 checkpoints                                    | |
| |                                                                            | |
| | Likely objective                                                           | |
| | Determine why join order regressed.                                        | |
| |                                                                            | |
| | Recent evidence                                                            | |
| | - one note suggests stale stats are involved                               | |
| | - a newer note suggests the issue persists after stats refresh             | |
| |                                                                            | |
| | Contradiction detected                                                     | |
| | Recent checkpoints disagree on whether stats refresh resolved the issue.   | |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| Recent checkpoints                                                             |
| +----------------------------------------------------------------------------+ |
| | 5:03 PM  Refreshing stats did not fix the join order.                     | |
| +----------------------------------------------------------------------------+ |
| +----------------------------------------------------------------------------+ |
| | 4:57 PM  Query improved after stats refresh.                              | |
| +----------------------------------------------------------------------------+ |
|                                                                                |
| Timeline                                                                       |
| ...                                                                            |
+--------------------------------------------------------------------------------+
```

### Use when
- recent notes conflict
- you want ambiguity preserved rather than smoothed over

---

## H. Main view with compact task summary rail

```text
+--------------------------------------------------------------------------------+
| Checkpoint                                                      [New capture]  |
+----------------------+---------------------------------------------------------+
| Current task         | Investigate timeout                                     |
| Investigate timeout  | Updated today at 2:14 PM                                |
| 9 checkpoints        |                                                         |
| Updated 2m ago       | +-----------------------------------------------------+ |
|                      | | Resume snapshot                             Fresh   | |
| Other tasks          | +-----------------------------------------------------+ |
| - Fix parser bug     |                                                         |
| - Resume eval flow   | Recent checkpoints                                      |
| - Query planner...   | ...                                                     |
|                      |                                                         |
| [View all tasks]     | Timeline                                                |
|                      | ...                                                     |
+----------------------+---------------------------------------------------------+
```

### Use when
- you want a lighter alternative to a full task list rail
- most of the time the user only needs the current task plus a small switch path

---

# 3. Optional Small States

## A. Task switcher popover

```text
+---------------------------------------------+
| Switch task                                 |
|                                             |
| Search tasks...                             |
|                                             |
| > Fix parser bug            8m ago          |
|   Resume eval flow          42m ago         |
|   Investigate timeout       yesterday       |
|   Query planner notes       2d ago          |
|                                             |
| [Close]                                      |
+---------------------------------------------+
```

---

## B. Delete task confirmation

```text
+----------------------------------------------------------+
| Delete task                                              |
|                                                          |
| Delete "Fix parser bug"?                                 |
| This removes the task and all saved checkpoints.         |
|                                                          |
| [Cancel]                                 [Delete task]   |
+----------------------------------------------------------+
```

---

## C. Delete checkpoint confirmation

```text
+----------------------------------------------------------+
| Delete checkpoint                                        |
|                                                          |
| Delete this checkpoint from 3:39 PM?                     |
| This cannot be undone.                                   |
|                                                          |
| [Cancel]                             [Delete checkpoint] |
+----------------------------------------------------------+
```

---

## D. Storage / privacy note

```text
+------------------------------------------------------------------+
| Storage                                                          |
|                                                                  |
| Checkpoints are stored locally on this device.                   |
| No hidden sharing.                                               |
|                                                                  |
| [Close]                                                          |
+------------------------------------------------------------------+
```

---

# 4. Fast Build Recommendation

If time is tight, build these first:

1. minimal capture overlay
2. one-column main view with compact task switcher
3. stale snapshot state
4. no snapshot yet state
5. empty state
6. delete task confirmation

That is enough for a strong capture -> reopen -> resume demo without spending time on a separate recent-tasks page.

---

# 5. Summary

These mockups reflect a simplified MVP structure:

- one capture overlay for both checkpoints and new-task creation
- main app opens directly into the task / resume view
- task switching is embedded navigation, not a dedicated page
- raw history remains immediately visible
- AI output stays lightweight and easy to verify

Use these as implementation scaffolding rather than fixed visual specs.
