import { Mode, STYLE } from '../../../constant';
import { Answer, Answered, Question } from '../../../types/type';

export const styleAnswer = (
  answer: Answer,
  currentQuestion: Question,
  answered: Answered,
  done: boolean,
  mode: number,
  color: string,
  selected: number,
  selectedAnswers: number[],
  currentQuestionIndex: number,
  currentAnswerIndex: number
) => {
  let fontColor = STYLE.FONT_COLOR_NORMAL;
  let fontWeight = STYLE.FONT_WEIGHT_NORMAL;
  let isSelected = false;

  if (currentQuestion.isMultiple) {
    if (answered[currentQuestionIndex]) {
      if (answered[currentQuestionIndex].selectedMultiple?.includes(currentAnswerIndex)) {
        if (answer.result === false) {
          fontColor = STYLE.FONT_INCORRECT_COLOR;
        } else {
          fontColor = STYLE.FONT_CORRECT_COLOR;
        }
        isSelected = true;
      } else {
        if (answer.result === true) {
          fontColor = STYLE.FONT_CORRECT_COLOR;
        }
      }
    } else if (selectedAnswers.includes(currentAnswerIndex)) {
      if (done && answer.result === false) {
        fontColor = STYLE.FONT_INCORRECT_COLOR;
      } else {
        fontWeight = STYLE.FONT_WEIGHT_BOLD;
      }
      isSelected = true;
    } else if (done && answer.result === true) {
      fontColor = STYLE.FONT_CORRECT_COLOR;
    } else if (mode === Mode.Practice && answer.result === true) {
      fontColor = STYLE.FONT_CORRECT_COLOR;
    }
  } else {
    if (mode === Mode.Practice && answer.result === true) {
      fontColor = STYLE.FONT_CORRECT_COLOR;
      isSelected = true;
    } else if (answered[currentQuestionIndex]?.selected === currentAnswerIndex) {
      if (answer.result === true) {
        fontColor = STYLE.FONT_CORRECT_COLOR;
      } else {
        fontColor = STYLE.FONT_INCORRECT_COLOR;
      }
      isSelected = true;
    } else if (selected === currentAnswerIndex && done === true) {
      fontColor = color;
      isSelected = true;
    } else if (selected !== -1 && answer.result === true && done === true) {
      fontColor = STYLE.FONT_CORRECT_COLOR;
      isSelected = true;
    }
  }

  return { fontColor, isSelected, fontWeight };
};
