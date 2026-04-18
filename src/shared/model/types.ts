export const LOAD_STATUS = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

export type LoadStatusType = keyof typeof LOAD_STATUS;

export interface FileItemType {
  id: string;
  name: string;
}

export enum WorkerMessageType {
  INIT_FILES = 'INIT_FILES',
  LOAD_FILES = 'LOAD_FILES',
  SEARCH_IN_FILES = 'SEARCH_IN_FILES',
  REMOVE_FILE = 'REMOVE_FILE',
  REMOVE_ALL_FILES = 'REMOVE_ALL_FILES',
}

export enum WorkerResponseEvent {
  ALL_FILES_UPDATED = 'ALL_FILES_UPDATED',
  LOAD_FILES_FINISHED = 'LOAD_FILES_FINISHED',
}
export type FileBufferType = FileItemType & {
  buffer: ArrayBuffer;
};
export type WorkerActionType =
  | { type: WorkerMessageType.SEARCH_IN_FILES; search: string }
  | { type: WorkerMessageType.REMOVE_FILE; id: string }
  | { type: WorkerMessageType.REMOVE_ALL_FILES }
  | { type: WorkerMessageType.INIT_FILES; modelId: string }
  | { type: WorkerMessageType.LOAD_FILES; data: FileBufferType[] };

export type WorkerResponseType =
  | {
      type: WorkerResponseEvent.ALL_FILES_UPDATED;
      data: FileItemType[];
    }
  | {
      type: WorkerResponseEvent.LOAD_FILES_FINISHED;
      status: LoadStatusType;
      data?: FileItemType[];
      message?: string;
    };
