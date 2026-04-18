import { ChunksBufferType, PageChunksType } from '../pdf';
import { PageVectorsType } from '../db';
import { cosineSimilarity } from './utils';

type GeneratorType = (text: string) => Promise<Float32Array>;

export class Vectors {
  filesVectors: { name: string; id: string; vectors: PageVectorsType[] }[] = [];
  newfilesVectors: { name: string; id: string; vectors: PageVectorsType[] }[] =
    [];
  private generate: GeneratorType | null = null;
  addGenerator(generate: GeneratorType) {
    this.generate = generate;
  }
  async generateFileVectors(
    pageChunks: PageChunksType[],
  ): Promise<PageVectorsType[]> {
    if (!this.generate) {
      throw new Error('Сначала модель должна быть загружена.');
    }
    const pagesVectors: PageVectorsType[] = [];
    for (let j = 0; j < pageChunks.length; j++) {
      const currentPage = pageChunks[j];
      if (
        !currentPage ||
        !currentPage.chunks ||
        currentPage.chunks.length === 0
      ) {
        continue;
      }
      const pageStartTime = performance.now();
      const pageVectors: any[] = [];
      for (let i = 0; i < currentPage.chunks.length; i++) {
        const chunkText = currentPage.chunks[i];
        const vector = await this.generate(chunkText);
        pageVectors.push(vector);
      }
      pagesVectors.push({
        p: currentPage.p,
        image: currentPage.imageData,
        chunks: currentPage.chunks,
        vectors: pageVectors,
      });
      const pageEndTime = performance.now();
      const totalPageDuration = ((pageEndTime - pageStartTime) / 1000).toFixed(
        2,
      );
      console.log(
        `Векторы для страницы ${j} готовы за ${totalPageDuration} сек.`,
      );
    }
    return pagesVectors;
  }
  async addNewVectors(chunksBuffer: Map<string, ChunksBufferType>) {
    const keys = Array.from(chunksBuffer.keys());
    this.newfilesVectors = [];
    for (const id of keys) {
      const fileData = chunksBuffer.get(id);

      if (!fileData) continue;

      const vectors = await this.generateFileVectors(fileData.chunks);
      this.newfilesVectors.push({ id, name: fileData.name, vectors });
      chunksBuffer.delete(id);
    }
  }
  setVectors(
    vectors: { name: string; id: string; vectors: PageVectorsType[] }[],
  ) {
    this.filesVectors = vectors;
  }
  getVectors() {
    return this.filesVectors;
  }
  getNewVectors() {
    return this.newfilesVectors;
  }
  getAllFiles() {
    return this.filesVectors.map((fileData) => ({
      name: fileData.name,
      id: fileData.id,
    }));
  }
  hasGenerator() {
    return Boolean(this.generate);
  }
  async findVectors(search: string) {
    if (!this.generate) {
      throw new Error('Сначала модель должна быть загружена.');
    }
    const vectorSearch = await this.generate(search);
    const matches: {
      score: number;
      p: number;
      name: string;
      chunks: string[];
    }[] = [];
    this.filesVectors.forEach(({ name, vectors: fileVectors }) => {
      fileVectors.forEach(({ p, vectors: pageVectors, chunks }) => {
        pageVectors.forEach((vector) => {
          const score = cosineSimilarity(vectorSearch, vector);
          matches.push({
            score: score,
            p,
            name,
            chunks,
          });
        });
      });
    });
    matches.sort((a: any, b: any) => b.score - a.score);

    for (let i = 0; i < Math.min(8, matches.length); i++) {
      console.log(`Score: ${matches[i].score}`);
      console.log(`Page: ${matches[i].p}`);
      console.log(`Doc: ${matches[i].name}`);
      console.log(`Doc: ${matches[i].chunks}`);
    }
  }
}
