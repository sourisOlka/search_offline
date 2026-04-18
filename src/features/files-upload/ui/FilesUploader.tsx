'use client';

import { LOAD_STATUS } from '@/src/shared';

import { FilesUploaderProps } from '../model/types';
import { useFileUploader } from '../model/useFileUploader';

export const FileUploader = (props: FilesUploaderProps) => {
  const { fileInputRef, isLoading, onAddFiles, handleContainerClick } =
    useFileUploader(props);
  const { loadingFiles } = props;
  return (
    <div className="mx-auto w-full max-w-md p-4">
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        multiple
        disabled={isLoading}
        className="hidden"
        onChange={onAddFiles}
      />

      <div
        onClick={handleContainerClick}
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-all ${
          isLoading
            ? 'cursor-default border-slate-200 bg-slate-100 opacity-60'
            : 'cursor-pointer border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
        } `}
      >
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform ${isLoading ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-blue-600 group-hover:scale-110'} `}
        >
          <svg
            xmlns="http://w3.org"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-slate-700">
          {isLoading
            ? 'Обработка файлов...'
            : 'Нажмите для загрузки или перетащите PDF'}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {loadingFiles.map((file, idx) => (
          <div
            key={idx}
            className="animate-in fade-in slide-in-from-bottom-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50 text-[10px] font-bold text-red-500">
                PDF
              </div>
              <span className="max-w-[150px] truncate text-sm font-medium text-slate-700">
                {file.name}
              </span>
            </div>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-wider uppercase ${
                file.status === LOAD_STATUS.LOADING
                  ? 'animate-pulse bg-amber-100 text-amber-600'
                  : file.status === LOAD_STATUS.SUCCESS
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              {file.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
