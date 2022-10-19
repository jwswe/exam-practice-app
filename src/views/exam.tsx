import { Paper, styled, IconButton, Switch, FormControlLabel, Modal } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Container } from '@mui/system';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { QuestionPrefix } from '../constant';
import question from '../data/questions_1.json';
import { Answered, Question } from '../types/type';
import { useSearchParams } from 'react-router-dom';
import AnsweredList from './AnsweredList';

const correctColor = '#118E20';
const incorrectColor = '#F15050';
const selectedColor = '#D9D9D9';
const bold = '600';

const loadQuestion = (number: number) => {
  return (question as Question[])[number];
};

export const Exam = () => {
  const [openModal, setOpenModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [current, setCurrent] = useState<number>(Number(searchParams.get('q') || 1) - 1);
  const [selected, setSelected] = useState<number>(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [color, setColor] = useState(selectedColor);
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState<Answered>({});
  const [practice, setPractice] = useState<boolean>(false);
  const totalQuestion = question.length;
  const currentQuestion = loadQuestion(current);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

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
          if (selectedAnswers.length === 0) {
            setSelectedAnswers([index]);
          } else {
            const updatedAnswer = [...selectedAnswers, index];
            setSelectedAnswers(updatedAnswer);
            if (updatedAnswer.length === currentQuestion.totalAnswer) {
              const correctAnswer = currentQuestion.answers
                .map((a, i) => {
                  return a.result === true ? i : undefined;
                })
                .filter((n) => n !== undefined);
              setAnswered({
                ...answered,
                [current]: {
                  selectedMultiple: updatedAnswer,
                  isCorrect: JSON.stringify(correctAnswer) === JSON.stringify(updatedAnswer),
                },
              });

              setDone(true);
              setTimeout(() => changeQuestion(true), 600);
            }
          }
        }
      } else {
        if (selected === -1) {
          setSelected(index);
          setDone(true);
          if (result === true) {
            setColor(correctColor);
          } else {
            setColor(incorrectColor);
          }

          setAnswered({
            ...answered,
            [current]: {
              selected: index,
              isCorrect: result,
            },
          });
        }
        setTimeout(() => changeQuestion(true), 600);
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
      <TopContainer>
        <IconButton
          color="primary"
          aria-label="Previous"
          component="label"
          onClick={() => changeQuestion(false)}
          disabled={current === 0}
        >
          <ChevronLeft style={{ width: 50, height: 50 }} />
        </IconButton>
        <Heading>{`Question: ${current + 1}/${totalQuestion} `}</Heading>
        <IconButton
          color="primary"
          aria-label="Next"
          component="label"
          onClick={() => changeQuestion(true)}
          disabled={current + 1 === totalQuestion}
        >
          <ChevronRight style={{ width: 50, height: 50 }} />
        </IconButton>
      </TopContainer>
      <StyledPaper>
        <QuestionText key={currentQuestion.question} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {currentQuestion.question}
        </QuestionText>
        <AllAnswers />
      </StyledPaper>
      <Label
        control={<StyledSwitch color="primary" checked={practice} onChange={() => setPractice(!practice)} />}
        label="Practice"
      />
      <Label control={<StyledSwitch color="primary" checked={openModal} onChange={handleOpen} />} label="History" />
      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <AnsweredList
          handleQuestionOnclick={(number) => {
            setOpenModal(false);
            setCurrent(number);
          }}
          totalQuestions={totalQuestion}
          answered={answered}
        />
      </Modal>
    </Container>
  );
};

const StyledPaper = styled(Paper)({
  padding: 30,
  background: 'rgb(0, 30, 60)',
  marginLeft: 0,
  marginRight: 0,
});
const Label = styled(FormControlLabel)({
  marginTop: 20,
  color: selectedColor,
  whiteSpace: 'pre-line',
  '@media only screen and (max-width: 600px)': {
    marginTop: 10,
    marginBottom: 10,
  },
});
const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-track': {
    backgroundColor: '#878787',
  },
});
export const Text = styled(motion.div)({
  textAlign: 'left',
  fontSize: 20,
  color: selectedColor,
  whiteSpace: 'pre-line',
});
const QuestionText = styled(Text)({
  fontSize: 18,
});
const AnswerContainer = styled('div')({
  marginTop: 20,
  paddingBottom: 50,
});
export const Heading = styled(Text)({
  fontWeight: 500,
});
const Answer = styled(Text)({
  cursor: 'default',
  fontSize: 20,
  marginTop: 10,
  borderRadius: 5,
  '@media only screen and (max-width: 600px)': {
    fontSize: 19,
  },
});
const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});
