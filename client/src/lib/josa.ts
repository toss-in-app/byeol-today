/** 한글 받침에 따라 조사를 골라 붙여요. 한글이 아닌 끝 글자는 받침 없음으로 봐요 */
function hasFinal(word: string): boolean {
  // 끝의 따옴표·괄호·공백은 건너뛰고 마지막 글자를 봐요("'짝과 관계'" → '계')
  const core = word.replace(/['"‘’“”)\]\s]+$/, '');
  const code = core.charCodeAt(core.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

/** '짝과 관계' → '짝과 관계를', '나와 컨디션' → '나와 컨디션을' */
export function eulReul(word: string): string {
  return `${word}${hasFinal(word) ? '을' : '를'}`;
}
