/**
 * Транслитерация русского текста в латиницу для создания slug
 */
export function transliterate(text: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    ' ': '-', '_': '-', '/': '-', '\\': '-', '.': '-', ',': '-',
    ':': '-', ';': '-', '!': '', '?': '', '"': '', "'": '', '(': '', ')': '',
    '[': '', ']': '', '{': '', '}': '', '<': '', '>': '', '=': '', '+': '',
    '*': '', '&': '', '%': '', '$': '', '#': '', '@': '', '~': '', '`': ''
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (translitMap[char] !== undefined) {
      result += translitMap[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char;
    }
  }

  // Убираем множественные дефисы и дефисы в начале/конце
  result = result
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .toLowerCase();

  return result;
}

/**
 * Генерирует уникальный slug, добавляя номер если нужно
 */
export function generateSlug(text: string, existingSlugs: string[] = []): string {
  let slug = transliterate(text);
  
  if (!slug) {
    slug = 'item';
  }

  // Если slug уже существует, добавляем номер
  if (existingSlugs.includes(slug)) {
    let counter = 1;
    let newSlug = `${slug}-${counter}`;
    while (existingSlugs.includes(newSlug)) {
      counter++;
      newSlug = `${slug}-${counter}`;
    }
    return newSlug;
  }

  return slug;
}
