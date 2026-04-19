export type Checkpoint = {
  id: string
  taskId: string
  description: string
  evidence: string[]
  createdAt: string
}

export type Task = {
  id: string
  parentTaskId: string | null,
  title: string
  createdAt: string
  updatedAt: string
  lastOpenedAt?: string
  snapshot?: Snapshot
}

/**
 * Stores the latest AI-generated summary for a task along with some metadata.
 */
export type Snapshot = {
  basedOnLastCheckpointId: string
  text: string
  generatedAt: string
}

/**
 * The entire JSON object saved by the app.
 */
export type AppData = {
  currentTaskId?: string
  tasks: Task[]
  checkpoints: Checkpoint[]
}

/**
 * Computed freshness metadata for a task snapshot.
 * Used in the UI to render relevant freshness metadata.
 */
export type SnapshotStatus = {
  isStale: boolean
  basedOnLastCheckpointId?: string
  latestCheckpointId?: string
  generatedAt?: string
}

/**
 * Computed metadata for a task.
 * Used in the UI to render the tasks list tab.
 */
export type TaskSummary = {
  id: string
  parentTaskId: string | null
  title: string
  updatedAt: string
  lastOpenedAt?: string
  isCurrent: boolean
  checkpointCount: number
}

/**
 * Fully renderable model containing a task, its checkpoints, and its snapshot metadata.
 * Used in the UI to render the task/checkpoint summary panel
 */
export type TaskDetail = {
  task: Task
  checkpoints: Checkpoint[]
  snapshotStatus: SnapshotStatus
}

/**
 * Input for creating a new task.
 */
export type CreateTaskInput = {
  parentTaskId?: string | null
  description: string
  evidence?: string[]
}

/**
 * Input for saving a new checkpoint.
 */
export type SaveCheckpointInput = {
  taskId?: string
  description: string
  evidence?: string[]
}

/**
 * Result returned after creating a new task.
 */
export type CreateTaskResult = {
  task: Task
  checkpoint: Checkpoint
}

/**
 * Result returned after saving a checkpoint.
 */
export type SaveCheckpointResult = {
  task: Task
  checkpoint: Checkpoint
}
