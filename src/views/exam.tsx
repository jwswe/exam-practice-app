import { useState } from 'react';
import { Button } from 'react-bootstrap';
import question from '../data/questions.json';

const correctColor = '#58B849';
const incorrectColor = '#F15050';
const selectedColor = '#313131';
const bold = '600';

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

const loadQuestion = (number: number) => {
  return (question as Question[])[number];
};

export const Exam = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number>(-1);
  const [selecteds, setSelecteds] = useState<number[]>([]);
  const [color, setColor] = useState(selectedColor);
  const [done, setDone] = useState(false);

  const currentQuestion = loadQuestion(current);

  const changeQuestion = (isNext: boolean) => {
    setDone(false);
    setSelected(-1);
    setSelecteds([]);
    setColor(selectedColor);

    if (!isNext && current !== 0) {
      setCurrent(current - 1);
    }

    if (isNext) {
      setCurrent(current + 1);
    }
  };

  return (
    <div style={{ marginLeft: 20, marginRight: 20 }}>
      <div style={{ textAlign: 'left', fontSize: 20, color: selectedColor }}>{currentQuestion.question}</div>
      {currentQuestion.answers.map((a, i) => {
        let defaultColor = selectedColor;
        let weight = 'normal';

        if (currentQuestion.isMultiple) {
          if (selecteds.length) {
            selecteds.forEach((s) => {
              if (i === s) {
                if (done) {
                  if (a.result === true) {
                    defaultColor = correctColor;
                  } else {
                    defaultColor = incorrectColor;
                  }
                } else {
                  defaultColor = selectedColor;
                }
                weight = bold;
              }
            });
          }
        } else {
          if (i === selected && done === true) {
            defaultColor = color;
            weight = bold;
          }
          if (selected !== -1 && a.result === true && done === true) {
            defaultColor = correctColor;
            weight = bold;
          }
        }

        return (
          <div
            style={{ textAlign: 'left', fontSize: 18, paddingTop: 15, color: defaultColor, fontWeight: weight }}
            onClick={() => {
              //#TODO handle multiple answer

              if (currentQuestion.isMultiple) {
                if (!done) {
                  if (selecteds === []) {
                    setSelecteds([i]);
                  } else {
                    setSelecteds([...selecteds, i]);

                    if (selecteds.length === currentQuestion.totalAnswer) {
                      setDone(true);
                    }
                  }
                }
              } else {
                if (selected === -1) {
                  {
                    setSelected(i);
                    setDone(true);
                    if (a.result === true) {
                      setColor(correctColor);
                    } else {
                      setColor(incorrectColor);
                    }
                  }
                }
              }
            }}
          >
            {a.text}
          </div>
        );
      })}

      <div style={{ marginTop: 20 }}>
        <Button
          onClick={() => {
            changeQuestion(false);
          }}
          style={{ marginRight: 20 }}
        >
          Prev
        </Button>
        <Button
          onClick={() => {
            changeQuestion(true);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
