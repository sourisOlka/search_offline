import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.useBrowserCache = true;
env.localModelPath = '/';

export class EmbeddingGenerator {
  private model: any = null;
  private isModelLoaded: boolean = false;

  async loadModel() {
    try {
      const pageStartTime = performance.now();
      this.model = await pipeline('feature-extraction', '/model/');

      const pageEndTime = performance.now();
      const totalPageDuration = ((pageEndTime - pageStartTime) / 1000).toFixed(
        2,
      );
      console.log(`Модель загружена за ${totalPageDuration} сек.`);
      this.isModelLoaded = true;
    } catch (err) {
      throw err;
    }
  }
  getIsModelLoaded() {
    return this.isModelLoaded;
  }
  async generate(text: string): Promise<Float32Array> {
    if (!this.model) throw new Error('Сначала модель должна быть загружена.');

    const result = await this.model(text.trim(), {
      pooling: 'cls',
      normalize: true,
    });

    return result.data;
  }
}
