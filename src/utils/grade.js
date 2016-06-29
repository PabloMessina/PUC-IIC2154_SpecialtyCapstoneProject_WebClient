/**
 *  grade calculates the grade as seen by a student or teacher according to their
 *  evaluation system. SUPPOSITION: Grade obtained in threshold score
 *  is equivalent to average of maxGrade and minGrade.
 *  @param {integer} score  [percentage score the student got in evaluation]
 *  @param {integer} maxGrade Highest [possible achievable grade (ie 7, 100, etc)]
 *  @param {integer} minGrade [Lowest possible achievable grade (ie 1, 0, etc)]
 *  @param {intger} threshold [Minimum percentage score needed to approve evaluation (50%, 60%, etc).
 *            In other words: percentage needed to obtain half grade.]
 */
export default function grade(score, maxGrade, minGrade, threshold) {
  if (score <= threshold) {
    return ((score * ((((maxGrade + minGrade) / 2) - minGrade) / threshold)) + minGrade);
  } else {
    return ((score * ((maxGrade - ((maxGrade + minGrade) / 2)) / (1 - threshold)))
    + ((maxGrade + minGrade) / 2)
    + (threshold / (2 * (1 - threshold))) * (minGrade - maxGrade));
  }
}
