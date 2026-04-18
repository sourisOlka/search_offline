import { FileBufferType, LoadStatusType } from '@/src/shared';

export type FileStatusType = {
  name: string;
  id: string;
  status: LoadStatusType;
  error?: Error;
  errorMessage?: string;
};
export interface FilesUploaderProps {
  onLoadFilesBuffer: (buffers: FileBufferType[]) => void;
  loadingFiles: FileStatusType[];
  setLoadingFiles: (
    value: FileStatusType[] | ((prev: FileStatusType[]) => FileStatusType[]),
  ) => void;
}
