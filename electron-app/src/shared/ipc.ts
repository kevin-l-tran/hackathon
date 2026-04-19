export const IPC = {
  TASK_CREATE: 'task:create',
  TASK_LIST_RECENT: 'task:listRecent',
  TASK_LIST_CHILDREN: 'task:listChildren',
  TASK_GET: 'task:get',
  TASK_OPEN: 'task:open',
  TASK_DELETE: 'task:delete',
  TASK_MOVE: 'task:move',
  TASK_UPDATE_TITLE: 'task:updateTitle',

  CHECKPOINT_SAVE: 'checkpoint:save',
  CHECKPOINT_DELETE: 'checkpoint:delete',

  CLIPBOARD_READ: 'clipboard:read',
  SNAPSHOT_REFRESH: 'snapshot:refresh'
} as const
