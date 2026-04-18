import { init } from '@embedpdf/pdfium';
import { getTextParts, fixBrokenWords } from './utils';
import { LOAD_STATUS } from '../../model/types';
import {
  type ChunksBufferType,
  FileSubDataType,
  PageChunksType,
  PdfsReaderFilesStatus,
} from './types';
import { FileBufferType } from '@/src/features';

export class PDFReader {
  pdfium: any = null;
  chunksBuffer: Map<string, ChunksBufferType> = new Map();
  filesStatus: PdfsReaderFilesStatus[] = [];
  targetWidth: number = 1000;
  async loadPdfEngine() {
    if (this.pdfium) return;

    const response = await fetch('/pdfium.wasm');

    if (!response.ok) {
      throw new Error(`Не удалось загрузить WASM: ${response.statusText}`);
    }

    const wasmBinary = await response.arrayBuffer();

    this.pdfium = await init({ wasmBinary });
    this.pdfium.PDFiumExt_Init();
  }
  cleanText(text: string): string {
    return fixBrokenWords(text.trim());
  }
  getChunks(text: string): string[] {
    const cText = this.cleanText(text);
    if (!cText.length) {
      return [];
    }
    return getTextParts(cText, 100);
  }
  async getPageChunks(
    doc: number,
    p: number,
  ): Promise<{ pageChunks: string[] | null; imageData: ImageData | null }> {
    let pageChunks = null;
    let imageData = null;
    const page = this.pdfium.FPDF_LoadPage(doc, p);
    const textPage = this.pdfium.FPDFText_LoadPage(page);

    if (textPage) {
      const originalWidth = this.pdfium.FPDF_GetPageWidth(page);
      const originalHeight = this.pdfium.FPDF_GetPageHeight(page);
      const aspectRatio = originalHeight / originalWidth;
      const width = this.targetWidth;
      const height = Math.floor(this.targetWidth * aspectRatio);
      const bitmap = this.pdfium.FPDFBitmap_Create(width, height, 1);
      this.pdfium.FPDF_RenderPageBitmap(
        bitmap,
        page,
        0,
        0,
        width,
        height,
        0,
        0,
      );
      const bufferPointer = this.pdfium.FPDFBitmap_GetBuffer(bitmap);
      const rawBuffer = new Uint8Array(
        this.pdfium.pdfium.HEAPU8.buffer,
        bufferPointer,
        width * height * 4,
      );
      const rgbaArray = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < rawBuffer.length; i += 4) {
        rgbaArray[i] = rawBuffer[i + 2]; // R
        rgbaArray[i + 1] = rawBuffer[i + 1]; // G
        rgbaArray[i + 2] = rawBuffer[i]; // B
        rgbaArray[i + 3] = rawBuffer[i + 3]; // A
      }
      imageData = new ImageData(rgbaArray, width, height);

      const charCount = this.pdfium.FPDFText_CountChars(textPage);
      const textBufferSize = (charCount + 1) * 2;
      const textPointer = this.pdfium.pdfium.wasmExports.malloc(textBufferSize);
      this.pdfium.FPDFText_GetText(textPage, 0, charCount, textPointer);
      const textArray = new Uint16Array(
        this.pdfium.pdfium.HEAPU16.buffer,
        textPointer,
        charCount,
      );

      const pageText = String.fromCharCode(...textArray);
      pageChunks = this.getChunks(pageText);
      this.pdfium.pdfium.wasmExports.free(textPointer);
      this.pdfium.FPDFText_ClosePage(textPage);
      this.pdfium.FPDFBitmap_Destroy(bitmap);
    }

    this.pdfium.FPDF_ClosePage(page);
    return { pageChunks, imageData };
  }

  async readFiles(data: FileBufferType[]) {
    for (let i = 0; i < data.length; i++) {
      const { name, id, buffer } = data[i];

      if (this.chunksBuffer.get(id)) {
        continue;
      }
      const uint8Data = new Uint8Array(buffer);
      const size = uint8Data.length;
      const pointer = this.pdfium.pdfium.wasmExports.malloc(size);
      this.pdfium.pdfium.HEAPU8.set(uint8Data, pointer);
      const doc = this.pdfium.FPDF_LoadMemDocument(pointer, size, null);
      const fileChunks: PageChunksType[] = [];
      if (doc) {
        const pages = this.pdfium.FPDF_GetPageCount(doc);
        for (let p = 0; p < pages; p++) {
          const { pageChunks, imageData } = await this.getPageChunks(doc, p);
          if (pageChunks && imageData) {
            fileChunks.push({ p, chunks: pageChunks, imageData });
          }
        }
        this.filesStatus.push({ name, id, status: LOAD_STATUS.SUCCESS });
        this.pdfium.FPDF_CloseDocument(doc);

        this.chunksBuffer.set(id, { chunks: fileChunks, name });
      } else {
        const err = this.pdfium.FPDF_GetLastError();
        this.filesStatus.push({
          name,
          id,
          error: err,
          errorMessage: 'При чтении страниц произошла ошибка',
          status: LOAD_STATUS.ERROR,
        });
      }
      this.pdfium.pdfium.wasmExports.free(pointer);
    }
  }
  getFilesStatus() {
    return this.filesStatus;
  }
  getFilesChunks() {
    return this.chunksBuffer;
  }
}
