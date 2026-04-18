export const createPdfWorker = () => {
  return new Worker(new URL('./pdf.worker.ts', import.meta.url), {
    type: 'module',
  });
};
