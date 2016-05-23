/* eslint no-param-reassign:0 */
import levenshtein from 'fast-levenshtein';

export default function correction(qtype, correct, answer, options) {
  switch (qtype) {
    case 'tshort': return tshort(correct.options, answer.options[0], options);
    case 'multiChoice': return multiChoice(correct.choices, answer.choices, options);
    case 'trueFalse': return trueFalse(correct.value, answer.value, options);
    default: return null;
  }
}

/**
 * [tshort find nearest word in options and return correctness and accuracy]
 * @param  {array} correct [array with options]
 * @param  {string} answer  [answer to evaluate]
 * @return {object: { correctness: boolean, accuracy: double}}
 */
export function tshort(correct, answer, { threshold, lower, special }) {
  answer = lower ? answer.toLowerCase() : answer;
  answer = special ? transform(answer) : answer;
  const min = [].concat(correct).reduce((last, word) => {
    word = lower ? word.toLowerCase() : word;
    word = special ? transform(word) : word;

    // distance between
    const dist = levenshtein.get(answer, word);

    return last.dist < dist ? last : { dist, word };
  }, { dist: Infinity, word: '' });
  const isCorrect = threshold ? min.dist <= threshold : min.dist <= min.word.length / 2;
  return {
    correctness: isCorrect ? 1 : 0,
    accuracy: 100 - (min.dist * 100 / min.word.length),
  };
}

export function trueFalse(correct, answer) {
  return {
    correctness: answer === correct ? 1 : 0,
    accuracy: 1,
  };
}

export function multiChoice(correct, answer) {
  const reducing = (a, b) => a.reduce((count, current) => (b.indexOf(current) > -1 ? count : count + 1), 0);

  const max = correct.length;
  const dist = reducing(correct, answer) + reducing(answer, correct);
  return {
    correctness: Math.max(1 - (dist / max), 0),
    accuracy: 1,
  };
}

export function transform(s) {
  let r = s.replace(new RegExp('\\s', 'g'), '');
  r = r.replace(/[`´~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
  r = r.replace(new RegExp('[àáâãäå]', 'g'), 'a');
  r = r.replace(new RegExp('[èéêë]', 'g'), 'e');
  r = r.replace(new RegExp('[ìíîï]', 'g'), 'i');
  r = r.replace(new RegExp('ñ', 'g'), 'n');
  r = r.replace(new RegExp('[òóôõö]', 'g'), 'o');
  r = r.replace(new RegExp('[ùúûü]', 'g'), 'u');
  return r;
}
