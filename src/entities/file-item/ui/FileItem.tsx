'use client';

import { FileItemType } from '@/src/shared';

interface FileItemProps {
  file: FileItemType;
  onRemove: (id: string) => void;
}
export const FileItem = ({ file, onRemove }: FileItemProps) => {
  return (
    <li
      key={file.id}
      className="group flex items-center justify-between rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/50"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium tracking-tight text-slate-700">
            {file.name}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            PDF • Готов к обработке
          </span>
        </div>
      </div>

      <button
        onClick={() => onRemove(file.id)}
        className="right-3 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
        title="Удалить файл"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </li>
  );
};
