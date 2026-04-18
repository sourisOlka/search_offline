import { type LoadStatusType } from '../../model/types';

export type PageChunksType = {
  p: number;
  chunks: string[];
  imageData: ImageData;
};
export type ChunksBufferType = {
  chunks: PageChunksType[];
  name: string;
};
export type PdfsReaderFilesStatus = {
  status: LoadStatusType;
  name: string;
  error?: Error;
  errorMessage?: string;
  id: string;
};
export type FileSubDataType = {
  name: string;
  id: string;
};
