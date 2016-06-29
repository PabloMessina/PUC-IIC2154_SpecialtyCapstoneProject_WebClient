/* eslint no-param-reassign:0 */
import levenshtein from 'fast-levenshtein';

export default function correction(qtype, correct, answer, options) {
  switch (qtype) {
    case 'tshort': {
      const correctAnswer = correct.options || [];
      const userAnswer = answer.options ? answer.options[0] : '';
      return tshort(correctAnswer, userAnswer, options);
    }
    case 'multiChoice': return multiChoice(correct.choices, answer.choices, options);
    case 'trueFalse': return trueFalse(correct.value, answer.value, options);
    case 'correlation': return correlation(correct.choices, answer.choices, options);
    default: return null;
  }
}

/**
 * [tshort find nearest word in options and return correct and score]
 * @param  {array} correct [array with options]
 * @param  {string} answer  [answer to evaluate]
 * @return {object: { correct: boolean, score: double}}
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
    correct: isCorrect ? 1 : 0,
    score: 1 - (min.dist / min.word.length),
  };
}

export function trueFalse(correct, answer) {
  return {
    correct: answer === correct ? 1 : 0,
    score: 1,
  };
}

export function multiChoice(correct, answer) {
  const reducing = (a, b) => a.reduce((count, current) => (b.indexOf(current) > -1 ? count : count + 1), 0);

  const max = correct.length;
  const dist = reducing(correct, answer) + reducing(answer, correct);
  return {
    correct: dist === 0 ? 1 : 0,
    score: Math.max(1 - (dist / max), 0),
  };
}

export function correlation(correct, answer) {
  const equal = (a, b) => {
    if (a.length !== b.length) return false;
    return a.reduce((previous, current, index) => previous && b[index] === current, true);
  };
  const includes = (array, elem) => array
    .reduce((previous, current) => previous || (equal(current, elem) && equal(elem, current)), false);

  const reducing = (a, b) => b.reduce((count, current) => (includes(a, current) ? count : count + 1), 0);

  const max = correct.length;
  const dist = reducing(correct, answer) + reducing(answer, correct);
  return {
    correct: dist === 0 ? 1 : 0,
    score: Math.max(1 - (dist / max), 0),
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
