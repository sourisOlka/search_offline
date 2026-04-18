import { EmbeddingGenerator } from '../model';
import { DB } from '../db';
import { Vectors } from '../vectors';
import {
  LOAD_STATUS,
  type WorkerActionType,
  WorkerMessageType,
  WorkerResponseEvent,
  FileBufferType,
} from '../../model/types';
import { PDFReader } from '../pdf';

let generator: any = null;
let pdfReader: any = null;
let vectors: any = null;
let db: any = null;
let loadModelPromise: Promise<any> | null = null;
let isProcessing: boolean = false;

function initDB() {
  if (!db) {
    db = new DB();
  }
}
async function loadModel() {
  if (!generator) {
    generator = new EmbeddingGenerator();
    await generator.loadModel();
  }
}
async function loadPdfFiles(data: FileBufferType[]) {
  if (!pdfReader) {
    pdfReader = new PDFReader();
    await pdfReader.loadPdfEngine();
  }
  await pdfReader.readFiles(data);
}
function initVectors() {
  if (!vectors) {
    vectors = new Vectors();
  }
}
function vectorsAddGenerator() {
  if (vectors && !vectors.hasGenerator()) {
    vectors.addGenerator(generator.generate.bind(generator));
  }
}
async function getDataFromDb() {
  const savedVectors = await db.getAllEmbeddings();
  const savedFiles = (await db.getAllPdfs()) || [];

  const data = savedFiles.map((file: any) => ({
    ...file,
    vectors: savedVectors
      .filter((vector: any) => vector.pdf_id === file.id)
      .map(({ pdf_id, ...rest }: any) => rest),
  }));
  vectors.setVectors(data);
  const allFiles = vectors.getAllFiles();
  self.postMessage({ type: 'ALL_FILES_UPDATED', data: allFiles });
}
async function loadNewFiles(data: FileBufferType[]) {
  try {
    if (isProcessing) {
      return self.postMessage({
        type: WorkerResponseEvent.LOAD_FILES_FINISHED,
        status: LOAD_STATUS.ERROR,
        message: 'Не окончена предыдущая загрузка файлов',
      });
    }
    isProcessing = true;
    await Promise.all([loadModelPromise, loadPdfFiles(data)]);

    const chunks = pdfReader.getFilesChunks();
    await vectors.addNewVectors(chunks);
    const loadedFilesStatuses = pdfReader.getFilesStatus();
    const newVectors = vectors.getNewVectors();
    db.saveFilesData(newVectors);
    vectors.setVectors([...vectors.getVectors(), ...newVectors]);
    self.postMessage({
      type: WorkerResponseEvent.LOAD_FILES_FINISHED,
      status: LOAD_STATUS.SUCCESS,
      data: loadedFilesStatuses,
    });

    const allFiles = vectors.getAllFiles();
    self.postMessage({
      type: WorkerResponseEvent.ALL_FILES_UPDATED,
      data: allFiles,
    });
  } catch (err: any) {
    self.postMessage({
      type: WorkerResponseEvent.LOAD_FILES_FINISHED,
      status: LOAD_STATUS.ERROR,
      message: err.message,
    });
  } finally {
    isProcessing = false;
  }
}

self.onmessage = async (e: MessageEvent<WorkerActionType>) => {
  const action = e.data as WorkerActionType;

  switch (action.type) {
    case WorkerMessageType.SEARCH_IN_FILES:
      await vectors.findVectors(action.search);
      break;

    case WorkerMessageType.REMOVE_FILE:
      await db.deletePdfById(action.id);
      await getDataFromDb();
      break;

    case WorkerMessageType.REMOVE_ALL_FILES:
      await db.clearAllData();
      await getDataFromDb();
      break;

    case WorkerMessageType.INIT_FILES:
      initDB();
      initVectors();
      loadModelPromise = loadModel()
        .then(vectorsAddGenerator)
        .catch((err) => {
          console.error('Init failed', err);
          throw err;
        });
      await db.initDB();
      await getDataFromDb();
      break;

    case WorkerMessageType.LOAD_FILES:
      await loadNewFiles(action.data);
      break;
  }
};
