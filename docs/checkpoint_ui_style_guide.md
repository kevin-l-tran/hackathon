# Checkpoint UI Style Guide — Hackathon Version

## Purpose

Checkpoint should feel like a fast, trustworthy tool for interruption recovery during technical work.

The UI only needs to support one loop:

1. capture quickly
2. reopen later
3. resume quickly

That is the core product goal for the MVP.

---

## What the UI should optimize for

Prioritize these, in order:

1. **speed**
2. **clarity**
3. **trust**
4. **visual polish**

A polished UI is useful, but not if it slows capture or makes the AI feel more authoritative than the raw checkpoint history. The spec explicitly says raw checkpoints are the source of truth and that capture/resume must not block on AI.

---

## Core design rules

### 1. Keep the UI visually quiet
Use a restrained visual style. Avoid anything loud, playful, or dashboard-like.

### 2. Make hierarchy obvious
Each screen should have one clear primary focus.

### 3. Let spacing do the work
Use consistent spacing to separate content before adding borders or decorative containers.

### 4. Keep the component set small
Reuse a few patterns consistently:
- text input
- button
- task row
- status badge
- checkpoint row
- snapshot panel

### 5. Favor readability over density
The app should feel efficient, but never cramped or noisy.

---

## Product-wide visual direction

The app should feel:

- calm
- technical
- minimal
- trustworthy
- fast

Avoid making it feel like:
- a productivity dashboard
- a note-taking app
- a chat app
- an “AI assistant” interface

Checkpoint is a recovery tool, not a conversation product.

---

## Screen priorities

The MVP only needs three main surfaces:

1. **capture overlay**
2. **recent tasks list**
3. **task / resume view**

That matches the product surfaces defined in the spec and architecture doc.

---

## 1. Capture overlay

### Goal
Make checkpoint capture feel nearly frictionless.

### Should feel like
A small, focused input surface with one main job.

### Should emphasize
- one main text input
- optional clipboard attachment
- obvious save actions

### Should not include
- manual organization
- heavy settings
- tags
- long instructions
- dense metadata

### Visual rule
The text input should dominate the layout. Everything else should feel secondary.

This matches the spec’s requirement that capture be lighter than opening a notes app and often possible in just a few seconds.

---

## 2. Recent tasks list

### Goal
Help the user reopen work by recency.

### Should emphasize
- task title
- recent activity
- which task is current

### Should not become
- a dashboard
- a filter-heavy management view
- a dense table of metadata

### Visual rule
Keep rows simple and highly scannable.

This aligns with the MVP’s recent-tasks-by-recency model.

---

## 3. Task / resume view

### Goal
Help the user answer:
- what was I doing?
- what did I already check?
- what should I do next?

Those are the explicit resume requirements in the spec.

### Recommended content order
1. task title
2. resume snapshot
3. snapshot freshness/status
4. recent raw checkpoints
5. full raw timeline

That order comes directly from the product spec.

### Visual rule
The snapshot should be prominent, but the raw checkpoints must remain easy to inspect immediately below it.

### Important trust rule
The snapshot is helpful interpretation, not ground truth. Raw checkpoints must remain visibly available and easy to compare against the AI output.{index=9}

---

## AI presentation rules

### Show inference as tentative
Use labels like:
- Likely objective
- Likely next step
- Recent evidence

### Do not present AI as definitive
Avoid language or styling that makes the model sound certain when it is not.

### Keep freshness visible
A stale snapshot should be clearly distinguishable from a fresh one. The architecture doc recommends a simple fresh/stale model only.

### Never hide contradictions
If checkpoints conflict, surface that plainly. Do not smooth it over.

---

## Typography guidance

Keep the type system simple.

Use text styles that clearly separate:
- task titles
- section labels
- main content
- metadata
- status text

Good typography for this product should make the screen faster to scan, not more expressive.

---

## Color guidance

Use color sparingly.

Color should mainly indicate:
- focus
- primary actions
- active/current task
- freshness/warning states
- destructive actions

Avoid using many colors with many meanings. The app should stay visually calm.

---

## Layout guidance

### Prefer strong structure
A screen should be easy to understand at a glance.

### Constrain important reading areas
Avoid overly wide text regions.

### Use simple grouping
Group by proximity first. Add borders or containers only when needed.

### Avoid over-nesting
Too many boxed sections make technical UIs feel cluttered.

---

## Interaction guidance

### Prefer direct, literal controls
Buttons and labels should say exactly what they do.

### Keep actions fast
Save, open, attach, and switch actions should feel immediate.

### Support keyboard flow where easy
This is useful for technical users, but it should not add complexity.

### Avoid multi-step flows
Checkpoint should feel lighter than a normal productivity tool.

---

## Copy guidance

Use short, plain, neutral copy.

Good examples:
- Save checkpoint
- Create new task
- Attach clipboard
- Resume snapshot
- Recent checkpoints
- Full timeline
- Last updated
- Snapshot stale

Avoid:
- clever labels
- AI marketing language
- abstract metaphors
- chatty microcopy

---

## What to avoid

Do not spend hackathon time on UI choices that increase complexity without improving the core loop.

Avoid:
- multiple navigation layers
- overly decorative styling
- too many badges/icons
- dense metadata everywhere
- chat-style AI layouts
- hiding raw history behind tabs
- making the snapshot look more trustworthy than the checkpoint history

---

## MVP visual quality bar

A good hackathon UI for Checkpoint should feel:

- faster than a notes app
- cleaner than raw notes
- simpler than a task manager
- more trustworthy than an auto-summary
- good enough to demo confidently

The implementation checklist also suggests keeping styling minimal and protecting time for polish late in the build.

---

## Build-time priority rule

When time is tight:

1. fix hierarchy
2. fix spacing
3. fix readability
4. fix interaction clarity
5. add polish last

Do not spend time on visual flourish before the capture → reopen → resume flow feels solid. That is also the recommended implementation order in the architecture and checklist docs.