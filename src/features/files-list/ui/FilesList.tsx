'use client';
import { FileItem, type FileItemType } from '@/src/entities';

interface FilesListProps {
  files: FileItemType[];
  onRemoveFile: (id: string) => void;
  onRemoveAllFiles: () => void;
}
export const FilesList = ({
  files,
  onRemoveFile,
  onRemoveAllFiles,
}: FilesListProps) => {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-slate-800">Список файлов</h3>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">
            {files.length}
          </span>
        </div>

        {files.length > 0 && (
          <button
            onClick={onRemoveAllFiles}
            className="flex items-center gap-1 text-xs font-bold tracking-wider text-red-500 uppercase transition-colors hover:text-red-600"
          >
            <span>Удалить все</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="p-2">
        {files.length > 0 ? (
          <ul className="space-y-1">
            {files.map((file) => (
              <FileItem file={file} onRemove={onRemoveFile} key={file.id} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <svg
              className="mb-3 h-12 w-12 opacity-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium">Список пуст</p>
          </div>
        )}
      </div>
    </div>
  );
};
