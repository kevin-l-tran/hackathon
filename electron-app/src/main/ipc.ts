import { ipcMain } from 'electron'

import { IPC } from '../shared/ipc'
import type { CreateTaskInput, SaveCheckpointInput } from '../shared/types'
import * as storage from './storage'
import { generateResumeSnapshot, suggestTitle } from './ai'

const RECENT_CHECKPOINT_LIMIT = 5

/**
 * Registers all IPC handlers exposed to the renderer through preload.
 * Keep this thin: validate inputs, call storage, and kick off non-blocking AI work.
 */
export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.TASK_CREATE, async (_event, input: CreateTaskInput) => {
    const result = await storage.createTask(input)

    // Do not block task creation on AI.
    void suggestAndPersistTitle(result.task.id, result.checkpoint.description)
    void refreshSnapshotForTask(result.task.id)

    return result
  })

  ipcMain.handle(IPC.TASK_LIST_RECENT, async () => {
    return storage.listRecentTasks()
  })

  ipcMain.handle(IPC.TASK_LIST_CHILDREN, async (_event, parentTaskId: string | null) => {
    return storage.listChildTasks(parentTaskId)
  })

  ipcMain.handle(IPC.TASK_GET, async (_event, taskId: string) => {
    return storage.getTask(taskId)
  })

  ipcMain.handle(IPC.TASK_OPEN, async (_event, taskId: string) => {
    const detail = await storage.openTask(taskId)

    // Do not block task open on snapshot refresh.
    void refreshSnapshotForTask(taskId)

    return detail
  })

  ipcMain.handle(IPC.TASK_DELETE, async (_event, taskId: string) => {
    await storage.deleteTask(taskId)
    return { ok: true }
  })

  ipcMain.handle(IPC.TASK_UPDATE_TITLE, async (_event, taskId: string, title: string) => {
    return storage.updateTaskTitle(taskId, title)
  })

  ipcMain.handle(IPC.CHECKPOINT_SAVE, async (_event, input: SaveCheckpointInput) => {
    const result = await storage.saveCheckpoint(input)

    // New checkpoint makes cached snapshot potentially stale.
    // Refresh asynchronously so save still feels instant.
    void refreshSnapshotForTask(result.task.id)

    return result
  })

  ipcMain.handle(IPC.CHECKPOINT_DELETE, async (_event, checkpointId: string) => {
    await storage.deleteCheckpoint(checkpointId)
    return { ok: true }
  })

  ipcMain.handle(IPC.SNAPSHOT_REFRESH, async (_event, taskId: string) => {
    await refreshSnapshotForTask(taskId)
    return storage.getTask(taskId)
  })
}

/**
 * Suggests a better task title from the initial checkpoint description.
 * Safe to fail silently because storage already created a fallback title.
 */
async function suggestAndPersistTitle(taskId: string, description: string): Promise<void> {
  const trimmed = description.trim()
  if (!trimmed) return

  try {
    const suggested = await suggestTitle(trimmed)
    if (!suggested?.trim()) return

    await storage.updateTaskTitle(taskId, suggested.trim())
  } catch (error) {
    console.error('Title generation failed:', error)
  }
}

/**
 * Rebuilds the cached snapshot for a task from its most recent checkpoints.
 * Safe to fail silently because raw checkpoints remain the source of truth.
 */
async function refreshSnapshotForTask(taskId: string): Promise<void> {
  try {
    const detail = await storage.getTask(taskId)
    const latestCheckpoint = detail.checkpoints[0]
    if (!latestCheckpoint) return

    const recent = detail.checkpoints
      .slice(0, RECENT_CHECKPOINT_LIMIT)
      .reverse()
      .map((checkpoint) => ({
        description: checkpoint.description,
        evidence: checkpoint.evidence,
        createdAt: checkpoint.createdAt
      }))

    const snapshotText = await generateResumeSnapshot(recent)
    if (!snapshotText?.trim()) return

    await storage.setTaskSnapshot(taskId, snapshotText.trim(), latestCheckpoint.id)
  } catch (error) {
    console.error('Snapshot refresh failed:', error)
  }
}
