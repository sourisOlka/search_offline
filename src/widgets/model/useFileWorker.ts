import { FileStatusType } from '@/src/features';
import {
  createPdfWorker,
  type FileItemType,
  LOAD_STATUS,
  FileBufferType,
} from '@/src/shared';
import {
  WorkerMessageType,
  WorkerResponseEvent,
} from '@/src/shared/model/types';
import { useState, useEffect, useRef } from 'react';

export const useFileWorker = () => {
  const [filesList, setFilesList] = useState<FileItemType[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<FileStatusType[]>([]);
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!worker.current) {
      worker.current = createPdfWorker();
    }

    const currentWorker = worker.current;

    currentWorker.postMessage({ type: WorkerMessageType.INIT_FILES });

    currentWorker.onmessage = (e: MessageEvent) => {
      const response = e.data;
      switch (response.type) {
        case WorkerResponseEvent.ALL_FILES_UPDATED:
          setFilesList(response.data);
          break;

        case WorkerResponseEvent.LOAD_FILES_FINISHED:
          if (response.status === LOAD_STATUS.SUCCESS) {
            setLoadingFiles(response.data);
          } else if (response.status === LOAD_STATUS.ERROR) {
            setLoadingFiles((prev) =>
              prev.map((file) => ({ ...file, status: LOAD_STATUS.ERROR })),
            );
          }
          break;

        default:
          console.warn(`Unhandled worker event: ${response.type}`);
      }
    };

    return () => {
      currentWorker.terminate();
      worker.current = null;
    };
  }, []);

  const onLoadFilesBuffer = (buffer: FileBufferType[]) => {
    if (!worker.current) return;

    const initialLoadingState = buffer.map((f) => ({
      id: f.id,
      name: f.name,
      status: LOAD_STATUS.LOADING,
    }));

    setLoadingFiles(initialLoadingState);

    const transferableBuffers = buffer.map((item) => item.buffer);

    worker.current.postMessage(
      {
        type: WorkerMessageType.LOAD_FILES,
        data: buffer,
      },
      transferableBuffers,
    );
  };

  const onSearch = (str: string) => {
    const value = str.trim();
    if (value.length > 0) {
      worker.current?.postMessage({
        type: WorkerMessageType.SEARCH_IN_FILES,
        search: value,
      });
    }
  };
  const onRemoveFile = (id: string) => {
    worker.current?.postMessage({
      type: WorkerMessageType.REMOVE_FILE,
      id,
    });
  };
  const onRemoveAllFiles = () => {
    worker.current?.postMessage({
      type: WorkerMessageType.REMOVE_ALL_FILES,
    });
  };

  return {
    filesList,
    loadingFiles,
    onLoadFilesBuffer,
    setLoadingFiles,
    onSearch,
    onRemoveFile,
    onRemoveAllFiles,
  };
};
