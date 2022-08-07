import { Paper, styled, IconButton, Switch, FormControlLabel } from '@mui/material';
import { ArrowCircleLeft, ArrowCircleRight } from '@mui/icons-material';
import { Container } from '@mui/system';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

import { QuestionPrefix } from '../constant';
import question from '../data/questions_1.json';
import { Answered, Question } from '../types/type';

const correctColor = '#118E20';
const incorrectColor = '#F15050';
const selectedColor = '#D9D9D9';
const bold = '600';

const loadQuestion = (number: number) => {
  return (question as Question[])[number];
};

export const Exam = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number>(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [color, setColor] = useState(selectedColor);
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState<Answered>({});
  const [practice, setPractice] = useState<boolean>(false);
  const totalQuestion = question.length;
  const currentQuestion = loadQuestion(current);

  const changeQuestion = (isNext: boolean) => {
    if (isNext && current + 1 === totalQuestion) {
      return;
    }

    setDone(false);
    setSelected(-1);
    setSelectedAnswers([]);
    setColor(selectedColor);

    if (!isNext && current !== 0) {
      setCurrent(current - 1);
    }

    if (isNext) {
      setCurrent(current + 1);
    }
  };

  const handleClickAnswer = (index: number, result: boolean) => {
    //#TODO handle multiple answer

    setTimeout(() => {
      if (practice || answered[current]) {
        return;
      }

      if (currentQuestion.isMultiple) {
        if (!done) {
          if (selectedAnswers === []) {
            setSelectedAnswers([index]);
          } else {
            const updatedAnswer = [...selectedAnswers, index];
            setSelectedAnswers(updatedAnswer);
            if (updatedAnswer.length === currentQuestion.totalAnswer) {
              setAnswered({
                ...answered,
                [current]: { selectedMultiple: updatedAnswer },
              });

              setDone(true);
              setTimeout(() => changeQuestion(true), 500);
            }
          }
        }
      } else {
        if (selected === -1) {
          setAnswered({
            ...answered,
            [current]: {
              selected: index,
            },
          });
          setSelected(index);
          setDone(true);
          if (result === true) {
            setColor(correctColor);
          } else {
            setColor(incorrectColor);
          }
        }
        setTimeout(() => changeQuestion(true), 500);
      }
    }, 100);
  };

  const AllAnswers: React.FC = () => (
    <AnswerContainer>
      {currentQuestion.answers.map((a, i) => {
        let displayColor = selectedColor;
        let fontWeight = 'normal';

        if (currentQuestion.isMultiple) {
          if (answered[current]) {
            (answered[current]?.selectedMultiple || []).forEach((s) => {
              if (i === s) {
                if (a.result === false) {
                  displayColor = incorrectColor;
                }
              }
              if (a.result === true) {
                displayColor = correctColor;
              }
              fontWeight = bold;
            });
          }

          if (practice && a.result === true) {
            displayColor = correctColor;
            fontWeight = bold;
          }

          if (selectedAnswers.length) {
            selectedAnswers.forEach((s) => {
              if (i === s) {
                if (done) {
                  if (a.result === false) {
                    displayColor = incorrectColor;
                  }
                } else {
                  displayColor = selectedColor;
                }
                fontWeight = bold;
              }

              if (done) {
                if (a.result === true) {
                  displayColor = correctColor;
                }
              }
            });
          }
        } else {
          if (practice && a.result === true) {
            displayColor = correctColor;
            fontWeight = bold;
          }

          if (answered[current] && answered[current].selected === i) {
            if (a.result === true) {
              displayColor = correctColor;
            } else {
              displayColor = incorrectColor;
            }
            fontWeight = bold;
          }

          if (i === selected && done === true) {
            displayColor = color;
            fontWeight = bold;
          }
          if (selected !== -1 && a.result === true && done === true) {
            displayColor = correctColor;
            fontWeight = bold;
          }
        }

        return (
          <Answer
            key={`answer-${i}`}
            style={{
              color: displayColor,
              fontWeight,
            }}
            onClick={() => (fontWeight === bold ? null : handleClickAnswer(i, a.result))}
          >
            {`${QuestionPrefix[i + 1]}. ${a.text}`}
          </Answer>
        );
      })}
    </AnswerContainer>
  );

  return (
    <Container>
      <ButtonContainer>
        <IconButton color="primary" aria-label="Previous" component="label">
          <Button hidden onClick={() => changeQuestion(false)} disabled={current === 0} />
          <ArrowCircleLeft style={{ width: 50, height: 50 }} />
        </IconButton>
        <IconButton color="primary" aria-label="Next" component="label">
          <Button hidden onClick={() => changeQuestion(true)} disabled={current + 1 === totalQuestion} />
          <ArrowCircleRight style={{ width: 50, height: 50 }} />
        </IconButton>
      </ButtonContainer>
      <StyledPaper>
        <Heading>{`Question: ${current + 1}/${totalQuestion}`}</Heading>
        <QuestionText>{currentQuestion.question}</QuestionText>
        <AllAnswers />
      </StyledPaper>
      <Label
        control={<StyledSwitch color="primary" checked={practice} onChange={() => setPractice(!practice)} />}
        label="Practice"
      />
    </Container>
  );
};

const StyledPaper = styled(Paper)({
  padding: 50,
  background: 'rgb(0, 30, 60)',
  marginLeft: 0,
  marginRight: 0,
});

const Label = styled(FormControlLabel)({
  color: selectedColor,
  whiteSpace: 'pre-line',
});

const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-track': {
    backgroundColor: '#878787',
  },
});

const Text = styled('div')({
  textAlign: 'left',
  fontSize: 20,
  color: selectedColor,
  whiteSpace: 'pre-line',
});

const QuestionText = styled(Text)({
  fontSize: 20,
});
const AnswerContainer = styled('div')({
  marginTop: 20,
  paddingBottom: 50,
});
const Heading = styled(Text)({
  marginBottom: 25,
  fontWeight: 500,
});

const Answer = styled(Text)({
  cursor: 'default',
  fontSize: 18,
  padding: 5,
  marginTop: 10,

  borderRadius: 5,
  '&:hover': {},
});

const ButtonContainer = styled('div')({
  marginTop: 50,
  display: 'flex',
  justifyContent: 'space-between',
});
