import { app } from "electron"
import * as fs from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"

import type {
  AppData,
  Checkpoint,
  CreateTaskInput,
  CreateTaskResult,
  SaveCheckpointInput,
  SaveCheckpointResult,
  SnapshotStatus,
  Task,
  TaskDetail,
  TaskSummary,
} from "../shared/types"

const DATA_FILE_NAME = "checkpoint-data.json"

/**
 * Returns the absolute path to the app's local JSON data file.
 * Used by all file read/write helpers.
 */
function getDataFilePath(): string {
  return path.join(app.getPath("userData"), DATA_FILE_NAME)
}

function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Creates the default empty storage payload for first run.
 * Used when the JSON file does not exist yet.
 */
function createEmptyData(): AppData {
  return {
    currentTaskId: undefined,
    tasks: [],
    checkpoints: [],
  }
}

/**
 * Ensures the local JSON storage file exists.
 * Creates the parent directory and initializes an empty file on first run.
 */
async function ensureDataFile(): Promise<void> {
  const filePath = getDataFilePath()

  try {
    await fs.access(filePath)
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(createEmptyData(), null, 2), "utf8")
  }
}

/**
 * Normalizes user-provided evidence snippets.
 * Trims whitespace, removes empty strings, and guarantees an array result.
 */
function normalizeEvidence(evidence?: string[]): string[] {
  if (!Array.isArray(evidence)) return []

  return evidence
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

/**
 * Returns a new array of tasks sorted by most recently updated first.
 * Used for recent-task views and fallback current-task selection.
 */
function sortTasksByUpdatedAtDesc(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

/**
 * Returns a new array of checkpoints sorted newest first.
 * Used when rendering task history and computing latest-checkpoint state.
 */
function sortCheckpointsByCreatedAtDesc(checkpoints: Checkpoint[]): Checkpoint[] {
  return [...checkpoints].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/**
 * Looks up a task by id and throws if it does not exist.
 * Use this when task existence is required.
 */
function getTaskById(data: AppData, taskId: string): Task {
  const task = data.tasks.find((t) => t.id === taskId)
  if (!task) {
    throw new Error(`Task not found: ${taskId}`)
  }
  return task
}

/**
 * Looks up a task by id and returns undefined if missing.
 * Use this when absence is acceptable.
 */
function getOptionalTaskById(data: AppData, taskId?: string | null): Task | undefined {
  if (!taskId) return undefined
  return data.tasks.find((t) => t.id === taskId)
}

/**
 * Returns all checkpoints for a task, sorted newest first.
 * This is the source for task history and snapshot freshness checks.
 */
function getTaskCheckpoints(data: AppData, taskId: string): Checkpoint[] {
  return sortCheckpointsByCreatedAtDesc(
    data.checkpoints.filter((cp) => cp.taskId === taskId),
  )
}

/**
 * Returns the id of the most recent checkpoint for a task, if one exists.
 * Used to determine whether a cached snapshot is fresh or stale.
 */
function getLatestCheckpointId(data: AppData, taskId: string): string | undefined {
  return getTaskCheckpoints(data, taskId)[0]?.id
}

/**
 * Computes snapshot freshness metadata for a task.
 * A snapshot is stale when it is not based on the latest checkpoint.
 */
function getSnapshotStatus(task: Task, latestCheckpointId?: string): SnapshotStatus {
  return {
    isStale: Boolean(
      latestCheckpointId &&
        task.snapshot?.basedOnLastCheckpointId !== latestCheckpointId,
    ),
    basedOnLastCheckpointId: task.snapshot?.basedOnLastCheckpointId,
    latestCheckpointId,
    generatedAt: task.snapshot?.generatedAt,
  }
}

/**
 * Returns the ids of a task and all of its descendants.
 * Used for subtree-safe operations such as delete and cycle checks.
 */
function getDescendantTaskIds(data: AppData, rootTaskId: string): Set<string> {
  const descendantIds = new Set<string>()
  const queue: string[] = [rootTaskId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    descendantIds.add(currentId)

    const childIds = data.tasks
      .filter((task) => task.parentTaskId === currentId)
      .map((task) => task.id)

    for (const childId of childIds) {
      if (!descendantIds.has(childId)) {
        queue.push(childId)
      }
    }
  }

  return descendantIds
}

/**
 * Verifies that a parent task exists when a non-null parent id is provided.
 * Throws if the parent id is invalid.
 */
function assertParentExistsIfProvided(data: AppData, parentTaskId: string | null): void {
  if (parentTaskId === null) return

  const parent = data.tasks.find((task) => task.id === parentTaskId)
  if (!parent) {
    throw new Error(`Parent task not found: ${parentTaskId}`)
  }
}

/**
 * Verifies that a task id exists in storage.
 * Throws if the task cannot be found.
 */
function assertTaskExists(data: AppData, taskId: string): void {
  const exists = data.tasks.some((task) => task.id === taskId)
  if (!exists) {
    throw new Error(`Task not found: ${taskId}`)
  }
}

/**
 * Builds a fallback task title from the initial checkpoint text.
 * Falls back again to a timestamp-based untitled label when needed.
 */
function makeFallbackTitle(description: string, createdAt: string): string {
  const trimmed = description.trim()

  if (trimmed.length > 0) {
    return trimmed.slice(0, 60)
  }

  return `Untitled task - ${new Date(createdAt).toLocaleString()}`
}

/**
 * Recomputes a task's updatedAt based on its newest remaining checkpoint.
 * Used after checkpoint deletion.
 */
function recalculateTaskUpdatedAt(data: AppData, taskId: string): void {
  const task = getTaskById(data, taskId)
  const checkpoints = getTaskCheckpoints(data, taskId)

  task.updatedAt = checkpoints[0]?.createdAt ?? task.createdAt
}

/**
 * Loads and parses the full JSON storage payload from disk.
 * Ensures the file exists first and returns a safe default shape.
 */
export async function loadData(): Promise<AppData> {
  await ensureDataFile()

  const raw = await fs.readFile(getDataFilePath(), "utf8")
  const parsed = JSON.parse(raw) as Partial<AppData>

  return {
    currentTaskId: parsed.currentTaskId,
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [],
  }
}

/**
 * Writes the full storage payload back to disk.
 * This is the single persistence write path for the JSON file.
 */
export async function saveData(data: AppData): Promise<void> {
  await fs.writeFile(getDataFilePath(), JSON.stringify(data, null, 2), "utf8")
}

/**
 * Returns lightweight task metadata for the recent-tasks list.
 * Includes current-task state and checkpoint count for each task.
 */
export async function listRecentTasks(): Promise<TaskSummary[]> {
  const data = await loadData()

  return sortTasksByUpdatedAtDesc(data.tasks).map((task) => {
    const checkpointCount = data.checkpoints.filter(
      (cp) => cp.taskId === task.id,
    ).length

    return {
      id: task.id,
      parentTaskId: task.parentTaskId,
      title: task.title,
      updatedAt: task.updatedAt,
      lastOpenedAt: task.lastOpenedAt,
      isCurrent: data.currentTaskId === task.id,
      checkpointCount,
    }
  })
}

/**
 * Returns the full detail payload for one task.
 * Includes the task, all checkpoints, and computed snapshot freshness data.
 */
export async function getTask(taskId: string): Promise<TaskDetail> {
  const data = await loadData()
  const task = getTaskById(data, taskId)
  const checkpoints = getTaskCheckpoints(data, taskId)
  const latestCheckpointId = checkpoints[0]?.id

  return {
    task,
    checkpoints,
    snapshotStatus: getSnapshotStatus(task, latestCheckpointId),
  }
}

/**
 * Marks a task as opened and makes it the current task.
 * Returns the same task detail payload used by the task view.
 */
export async function openTask(taskId: string): Promise<TaskDetail> {
  const data = await loadData()
  const task = getTaskById(data, taskId)

  task.lastOpenedAt = nowIso()
  data.currentTaskId = taskId

  await saveData(data)
  return getTask(taskId)
}

/**
 * Creates a new task and its initial checkpoint in one operation.
 * If parentTaskId is omitted, defaults to the current task as parent when available.
 */
export async function createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
  const data = await loadData()
  const createdAt = nowIso()

  const description = input.description.trim()
  if (!description) {
    throw new Error("Description is required.")
  }

  const evidence = normalizeEvidence(input.evidence)

  const resolvedParentTaskId =
    input.parentTaskId !== undefined
      ? input.parentTaskId
      : (data.currentTaskId ?? null)

  assertParentExistsIfProvided(data, resolvedParentTaskId)

  const task: Task = {
    id: randomUUID(),
    parentTaskId: resolvedParentTaskId,
    title: makeFallbackTitle(description, createdAt),
    createdAt,
    updatedAt: createdAt,
    lastOpenedAt: createdAt,
  }

  const checkpoint: Checkpoint = {
    id: randomUUID(),
    taskId: task.id,
    description,
    evidence,
    createdAt,
  }

  data.tasks.push(task)
  data.checkpoints.push(checkpoint)
  data.currentTaskId = task.id

  await saveData(data)

  return { task, checkpoint }
}

/**
 * Saves a new checkpoint to an existing task.
 * Defaults to the current task when taskId is omitted.
 */
export async function saveCheckpoint(
  input: SaveCheckpointInput,
): Promise<SaveCheckpointResult> {
  const data = await loadData()
  const createdAt = nowIso()

  const description = input.description.trim()
  if (!description) {
    throw new Error("Description is required.")
  }

  const evidence = normalizeEvidence(input.evidence)
  const taskId = input.taskId ?? data.currentTaskId

  if (!taskId) {
    throw new Error("No task selected. Create a task first.")
  }

  assertTaskExists(data, taskId)

  const task = getTaskById(data, taskId)
  const checkpoint: Checkpoint = {
    id: randomUUID(),
    taskId,
    description,
    evidence,
    createdAt,
  }

  data.checkpoints.push(checkpoint)
  task.updatedAt = createdAt
  data.currentTaskId = taskId

  await saveData(data)

  return { task, checkpoint }
}

/**
 * Updates a task title and refreshes its updatedAt timestamp.
 * Throws if the provided title is empty after trimming.
 */
export async function updateTaskTitle(taskId: string, title: string): Promise<Task> {
  const data = await loadData()
  const task = getTaskById(data, taskId)

  const trimmed = title.trim()
  if (!trimmed) {
    throw new Error("Title cannot be empty.")
  }

  task.title = trimmed
  task.updatedAt = nowIso()

  await saveData(data)
  return task
}

/**
 * Stores or replaces the cached resume snapshot for a task.
 * Used by async snapshot-generation flows.
 */
export async function setTaskSnapshot(
  taskId: string,
  snapshotText: string,
  basedOnLastCheckpointId: string,
): Promise<Task> {
  const data = await loadData()
  const task = getTaskById(data, taskId)

  const latestCheckpointId = getLatestCheckpointId(data, taskId)
  if (!latestCheckpointId) {
    throw new Error("Cannot set snapshot for task with no checkpoints.")
  }

  task.snapshot = {
    text: snapshotText.trim(),
    generatedAt: nowIso(),
    basedOnLastCheckpointId,
  }

  await saveData(data)
  return task
}

/**
 * Deletes a single checkpoint.
 * Clears the task snapshot if that snapshot depended on the deleted checkpoint,
 * then recomputes task recency metadata.
 */
export async function deleteCheckpoint(checkpointId: string): Promise<void> {
  const data = await loadData()
  const checkpoint = data.checkpoints.find((cp) => cp.id === checkpointId)

  if (!checkpoint) {
    throw new Error(`Checkpoint not found: ${checkpointId}`)
  }

  data.checkpoints = data.checkpoints.filter((cp) => cp.id !== checkpointId)

  const task = getOptionalTaskById(data, checkpoint.taskId)
  if (task) {
    if (task.snapshot?.basedOnLastCheckpointId === checkpointId) {
      task.snapshot = undefined
    }

    recalculateTaskUpdatedAt(data, task.id)
  }

  await saveData(data)
}

/**
 * Deletes a task and its full descendant subtree.
 * Also removes all checkpoints belonging to deleted tasks and repairs currentTaskId.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const data = await loadData()
  getTaskById(data, taskId)

  const idsToDelete = getDescendantTaskIds(data, taskId)

  data.tasks = data.tasks.filter((task) => !idsToDelete.has(task.id))
  data.checkpoints = data.checkpoints.filter(
    (checkpoint) => !idsToDelete.has(checkpoint.taskId),
  )

  if (data.currentTaskId && idsToDelete.has(data.currentTaskId)) {
    const remainingTasks = sortTasksByUpdatedAtDesc(data.tasks)
    data.currentTaskId = remainingTasks[0]?.id
  }

  await saveData(data)
}

/**
 * Returns the id of the current task, if one is set.
 * Useful for default-save behavior in the UI or IPC layer.
 */
export async function getCurrentTaskId(): Promise<string | undefined> {
  const data = await loadData()
  return data.currentTaskId
}

/**
 * Returns direct child tasks for a given parent.
 * Used to render one level of the task hierarchy.
 */
export async function listChildTasks(parentTaskId: string | null): Promise<TaskSummary[]> {
  const data = await loadData()

  const children = data.tasks.filter((task) => task.parentTaskId === parentTaskId)

  return sortTasksByUpdatedAtDesc(children).map((task) => ({
    id: task.id,
    parentTaskId: task.parentTaskId,
    title: task.title,
    updatedAt: task.updatedAt,
    lastOpenedAt: task.lastOpenedAt,
    isCurrent: data.currentTaskId === task.id,
    checkpointCount: data.checkpoints.filter((cp) => cp.taskId === task.id).length,
  }))
}