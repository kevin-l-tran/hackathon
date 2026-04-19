export type Checkpoint = {
  id: string
  taskId: string
  description: string
  createdAt: string[]
}

export type Task = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lastOpenedAt?: string
  snapshot?: Snapshot
}

export type Snapshot = {
  basedOnLastCheckpointId: string
  text: string
  generatedAt: string
}

export type AppData = {
  currentTaskId?: string
  tasks: Task[]
  checkpoints: Checkpoint[]
}
