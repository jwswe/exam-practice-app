import { Mode, THEME } from "../../../constant";
import {
  Answer,
  Answered,
  Question,
  QuestionType,
  ThemeOption,
} from "../../../types/type";

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
  currentAnswerIndex: number,
  themeOption: ThemeOption
) => {
  let fontColor = THEME[themeOption].FONT_COLOR_NORMAL;
  let fontWeight = THEME[themeOption].FONT_WEIGHT_NORMAL;
  let isSelected = false;
  if (currentQuestion.type === QuestionType.Multiple) {
    if (answered[currentQuestionIndex]) {
      if (
        answered[currentQuestionIndex].selectedMultiple?.includes(
          currentAnswerIndex
        )
      ) {
        if (answer.result === false) {
          fontColor = THEME[themeOption].FONT_INCORRECT_COLOR;
        } else {
          fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
        }
        isSelected = true;
      } else {
        if (answer.result === true) {
          fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
        }
      }
    } else if (selectedAnswers.includes(currentAnswerIndex)) {
      if (done && answer.result === false) {
        fontColor = THEME[themeOption].FONT_INCORRECT_COLOR;
      } else {
        fontWeight = THEME[themeOption].FONT_WEIGHT_BOLD;
      }
      isSelected = true;
    } else if (done && answer.result === true) {
      fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
    } else if (mode === Mode.Practice && answer.result === true) {
      fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
    }
  } else if (currentQuestion.type === QuestionType.Single) {
    if (mode === Mode.Practice && answer.result === true) {
      fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
      isSelected = true;
    } else if (answered[currentQuestionIndex]) {
      if (answered[currentQuestionIndex]?.selected === currentAnswerIndex) {
        if (answer.result === true) {
          fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
        } else {
          fontColor = THEME[themeOption].FONT_INCORRECT_COLOR;
        }
      } else if (answer.result === true) {
        fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
      }

      isSelected = true;
    } else if (selected === currentAnswerIndex && done === true) {
      isSelected = true;
    } else if (selected !== -1 && answer.result === true && done === true) {
      fontColor = THEME[themeOption].FONT_CORRECT_COLOR;
      isSelected = true;
    }
  }

  return { fontColor, isSelected, fontWeight };
};

export const isThemeOption = (value: string | null): value is ThemeOption => {
  return value === "LIGHT" || value === "DARK";
};

export const removeKeywords = (
  inputString: string,
  keywordsArray: (string | RegExp)[]
): string => {
  for (const keyword of keywordsArray) {
    const regex = new RegExp(keyword, "gi");
    inputString = inputString.replace(regex, "");
  }
  return inputString;
};
