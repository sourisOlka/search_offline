'use client';

import { FileUploader, FilesList, Search } from '@/src/features';

import { useFileWorker } from '../model/useFileWorker';

export const PdfReader = () => {
  const {
    onLoadFilesBuffer,
    loadingFiles,
    setLoadingFiles,
    filesList,
    onSearch,
    onRemoveAllFiles,
    onRemoveFile,
  } = useFileWorker();
  return (
    <div className="mx-auto w-full max-w-md p-4">
      <FileUploader
        onLoadFilesBuffer={onLoadFilesBuffer}
        loadingFiles={loadingFiles}
        setLoadingFiles={setLoadingFiles}
      />
      <Search onSearch={onSearch} />
      <FilesList
        files={filesList}
        onRemoveFile={onRemoveFile}
        onRemoveAllFiles={onRemoveAllFiles}
      />
    </div>
  );
};
