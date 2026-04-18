# Search Offline

**Experimental Client-Side RAG (Retrieval-Augmented Generation) Implementation.**

This project explores the capabilities of modern web browsers to run a full AI pipeline locally, ensuring 100% data privacy and zero server-side dependency.

## Architecture & Tech Stack

- **Next.js & FSD**: Built with Next.js using the **Feature-Sliced Design** methodology.
- **Transformers.js**: In-browser inference of pre-trained Hugging Face models. NLP tasks (embeddings, semantic analysis) are handled entirely on the client side without external APIs.
- **Pdfium (WASM)**: Integration of the high-performance, low-level **Pdfium** engine for efficient PDF structure parsing and text extraction.
- **Vector Storage (IndexedDB)**: Local vector and metadata storage implemented via **IndexedDB**, enabling persistent offline capabilities.
- **Multithreading (Web Workers)**: Compute-intensive operations (tokenization, vector search, parsing) are delegated to background workers to ensure a non-blocking UI and high interface responsiveness.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
