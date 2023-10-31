export function transliteration(text: string): string {
  const converter: any = {
    'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
    'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
    'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
    'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
    'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
    'ш': 'sh',   'щ': 'sch',  'ь': '',     'ы': 'y',    'ъ': '',
    'э': 'e',    'ю': 'yu',   'я': 'ya'
  };

  const url = text.toLowerCase()
  let answer = url.split('').reduce((acc: string, char: string)=> {
    converter[char] === undefined ? acc += char : acc += converter[char]
    return acc
  }, '')

  return answer.replace(/[^-0-9a-z]/g, '-').replace(/[-]+/g, '-').replace(/^\-|-$/g, '')
}
