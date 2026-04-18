# search_offline

Экспериментальный семантический поиск (RAG) на стороне клиента.

Проект исследует, как запускать нейросети на компьютере пользователя без отправки данных на сервер.

## Технологический стек и решения

- **Next.js & FSD**: Фреймворк приложения с использованием методологии Feature-Sliced Design для обеспечения модульности и масштабируемости кода.
- **Transformers.js**: Инференс предобученных моделей с Hugging Face на стороне клиента. Реализация NLP-задач (эмбеддинги, семантический анализ) без использования внешних API.
- **Pdfium (WASM)**: Использование низкоуровневого движка Pdfium для высокопроизводительного парсинга структуры PDF и извлечения текстового контента.
- **Vector Storage (IndexedDB)**: Организация локального хранилища векторов и метаданных в IndexedDB, что обеспечивает возможность офлайн-работы.
- **Multithreading (Web Workers)**: Делегирование ресурсоемких операций (токенизация, векторный поиск, парсинг) в фоновые потоки для обеспечения неблокирующего UI и высокой отзывчивости интерфейса.

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
