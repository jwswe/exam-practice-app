export interface QuestionPart {
  options: string[];
  correct: number;
}

export interface Question {
  question: string;
  answers?: Answer[];
  type: QuestionType;
  totalAnswer?: number;
  image?: string;
  parts?: Array<string | QuestionPart>;
  options?: Array<string>;
  sentences?: Array<string>;
  correctOrder?: Array<number>;
}

export interface Answer {
  text: string;
  result: boolean;
}

export interface Dropdown {
  selected?: number;
  isCorrect?: boolean;
}

export interface AnsweredDropdown {
  [key: number]: Dropdown;
}

export interface AnsweredChild {
  selected?: number;
  selectedMultiple?: number[];
  selectedMatch?: number[];
  isCorrect?: boolean;
  answeredDropdown?: AnsweredDropdown;
}

export interface Answered {
  [key: number]: AnsweredChild;
}

export enum QuestionType {
  Single = 1,
  Multiple = 2,
  Dropdown = 3,
  Match = 4,
}

export type ThemeOption = "DARK" | "LIGHT";

export type Theme = {
  [key in ThemeOption]: {
    [key: string]: string;
  };
};

export interface AnsweredListProps {
  totalQuestions: number;
  answered: Answered;
  handleQuestionOnclick: (questionNumber: number) => void;
  themeOption: ThemeOption;
}

export interface StyledButtonProps {
  themeOption: ThemeOption;
  background?: string;
}

export interface StyledComponentProps {
  themeOption: ThemeOption;
}
