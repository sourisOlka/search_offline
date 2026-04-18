import { useState, useRef, ChangeEvent } from 'react';
import { FilesUploaderProps } from './types';
import { generateId, isPdf, LOAD_STATUS, FileBufferType } from '@/src/shared';

export const useFileUploader = ({
  onLoadFilesBuffer,
  loadingFiles,
  setLoadingFiles,
}: FilesUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const isLoading = loadingFiles.some((f) => f.status === LOAD_STATUS.LOADING);

  const handleContainerClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const getBuffers = async (
    files: { id: string; name: string; file: File }[],
  ): Promise<FileBufferType[]> => {
    const loadingErrors = new Map();

    const promises = files.map(
      (fileItem) =>
        new Promise<FileBufferType | null>(async (resolve) => {
          try {
            const buffer = await fileItem.file.arrayBuffer();
            resolve({ id: fileItem.id, name: fileItem.name, buffer });
          } catch (err) {
            loadingErrors.set(fileItem.id, {
              error: err,
              errorMessage: 'Ошибка загрузки файла',
            });
            resolve(null);
          }
        }),
    );

    const results = await Promise.all(promises);

    if (loadingErrors.size > 0) {
      setLoadingFiles((prevFiles) =>
        prevFiles.map((file) => {
          const errorData = loadingErrors.get(file.id);
          return errorData
            ? { ...file, status: LOAD_STATUS.ERROR, ...errorData }
            : file;
        }),
      );
      loadingErrors.clear();
    }

    return results.filter((res): res is FileBufferType => res !== null);
  };

  const onAddFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesList = Array.from(files);
    const pdfFiles = filesList.filter(isPdf);

    if (pdfFiles.length === 0) {
      setError('Среди выбранных файлов нет PDF');
      return;
    }

    const filesListWithId = filesList.map((file) => ({
      id: generateId(),
      name: file.name,
      status: isPdf(file) ? LOAD_STATUS.LOADING : LOAD_STATUS.ERROR,
      file,
    }));

    setLoadingFiles(
      filesListWithId.map(({ id, name, status }) => ({ id, name, status })),
    );

    const buffers = await getBuffers(filesListWithId);
    onLoadFilesBuffer(buffers);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    fileInputRef,
    loadingFiles,
    error,
    isLoading,
    handleContainerClick,
    onAddFiles,
    setError,
  };
};
