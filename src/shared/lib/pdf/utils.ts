export function preparePart(text: string, start: number, end: number) {
  const pronouns = new Set([
    'он',
    'она',
    'оно',
    'они',
    'его',
    'ее',
    'их',
    'такого',
    'такой',
    'таких',
    'них',
    'этот',
    'эта',
    'это',
    'тот',
    'та',
    'эти',
    'те',
  ]);

  let to_save = text.substring(start, end + 1);
  const firstDotIdx = to_save.indexOf('.');

  if (firstDotIdx !== -1 && start !== 0) {
    const toSaveFirst = to_save.substring(0, firstDotIdx + 1);
    const words = toSaveFirst
      .split(/\s+/)
      .map((word) => word.toLowerCase().replace(/[.,!?:;()»«"']/g, ''));

    const hasPronoun = words.some((word) => pronouns.has(word));

    if (hasPronoun) {
      const prevDot = text.lastIndexOf('.', start - 2);
      if (prevDot !== -1) {
        to_save = text.substring(prevDot + 1, end + 1);
      }
    }
  }
  return to_save;
}
export function fixBrokenWords(text: string) {
  if (!text) return '';

  text = text.replace(/\xad/g, '').replace(/\xa0/g, ' ');
  text = text.trim();

  text = text.replace(/\s*<\s*[.…]+\s*>\s*/g, ' ');
  text = text.replace(/([а-яА-Яa-zA-Z])\?([а-яА-Яa-zA-Z])/g, '$1-$2');
  text = text.replace(/\?([а-яА-Яa-zA-Z])/g, '-$1');

  text = text.replace(/([а-яА-Яa-zA-Z])\?/g, '$1-');
  text = text.replace(/[\u2500-\u25FF\u2700-\u27BF\u2022]/g, ' ');
  text = text.replace(/[●■▪➔◆○\u25CF\u2022]/g, '');
  text = text.replace(
    /[\s\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]+/gu,
    ' ',
  );
  text = text.trim().replace(/\s{2,}/g, ' ');
  if (text.length < 2) return text.trim();

  text = text.replace(/\s*&\s*/g, '-');
  text = text.replace(/\s+/g, ' ');

  text = text.replace(/(_\s*){3,}/g, '');
  text = text.replace(/(-\s*){3,}/g, '');

  text = text.replace(/\s*\.\s*(?:\.\s*)+/g, '. ');

  return text.trim();
}
export function getTextParts(text: string, chunkSize: number = 400) {
  const totalLen = text.length;
  const partsCount = Math.floor(totalLen / chunkSize);

  const parts = [];
  let start = 0;
  if (partsCount < 2) {
    return [text];
  }
  for (let i = 0; i <= partsCount; i++) {
    if (i === partsCount) {
      if (start < totalLen) {
        parts.push(preparePart(text, start, totalLen - 1));
      }
      break;
    }

    const limit = start + chunkSize + 100;

    let end = text.lastIndexOf('.', limit);
    if (end < start) end = -1;

    if (end !== -1 && end + 2 < totalLen) {
      const charAfter = text[end + 2];
      if (charAfter && charAfter === charAfter.toLowerCase()) {
        end = text.lastIndexOf('.', end - 1);
        if (end < start) end = -1;
      }
    }

    if (end === -1) {
      end = text.lastIndexOf(' ', limit);
      if (end < start) end = -1;
    }

    if (end === -1) {
      end = start + chunkSize;
    } else {
      end += 1;
    }

    parts.push(preparePart(text, start, end));
    start = end + 1;

    if (start >= totalLen) break;
  }

  return parts;
}
