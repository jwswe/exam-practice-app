export interface Question {
  question: string;
  answers: Answer[];
  isMultiple?: boolean;
  totalAnswer?: number;
}

export interface Answer {
  text: string;
  result: boolean;
}

export interface Answered {
  [key: number]: {
    selected?: number;
    selectedMultiple?: number[];
    isCorrect?: boolean;
  };
}
