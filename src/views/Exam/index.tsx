import { Paper, styled, IconButton, Switch, FormControlLabel, Modal, Select, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Container } from '@mui/system';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Mode, QuestionPrefix, STYLE } from '../../constant';
import az900 from '../../data/questions_1.json';
import az204 from '../../data/questions_2.json';

import { Answer, Answered, Question } from '../../types/type';
import { useSearchParams } from 'react-router-dom';
import AnsweredList from '../AnswerHistory';
import { styleAnswer } from './utils';

/**
 * 1 normal
 * 2 practice
 * 3 revision
 * @returns
 */

export const Exam = () => {
  const [certificate, setCertificate] = useState<number>(1);
  const [openModal, setOpenModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [currentQuestionIndex, setCurrentCurrentQuestionIndex] = useState<number>(Number(searchParams.get('q') || 1) - 1);
  const [selected, setSelected] = useState<number>(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [color, setColor] = useState(STYLE.FONT_COLOR_NORMAL);
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState<Answered>({});
  const [mode, setMode] = useState<Mode>(1);

  const certs = {
    1: az204,
    2: az900,
  };

  const loadQuestion = (number: number) => (certs[certificate as keyof typeof certs] as Question[])[number];
  const totalQuestion = certs[certificate as keyof typeof certs].length;
  const currentQuestion = loadQuestion(currentQuestionIndex);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const handleRevision = () => {
    if (mode === Mode.Revision) {
      setMode(Mode.Normal);
    } else {
      const fa = Object.entries(answered).find(([_, v]) => !v.isCorrect);

      const firstWrongAnswer = fa ? fa[0] : undefined;

      if (JSON.stringify(answered) === '{}' || !firstWrongAnswer) {
        console.log('no wrong answer or not answered yet');
        return;
      }
      setMode(Mode.Revision);
    }
  };

  const changeQuestion = (isNext: boolean) => {
    if (isNext && currentQuestionIndex + 1 === totalQuestion) {
      return;
    }

    setDone(false);
    setSelected(-1);
    setSelectedAnswers([]);
    setColor(STYLE.FONT_SELECTED_COLOR);

    if (!isNext && currentQuestionIndex !== 0) {
      setCurrentCurrentQuestionIndex(currentQuestionIndex - 1);
    }

    if (isNext) {
      setCurrentCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleClickAnswer = (index: number, result: boolean) => {
    setTimeout(() => {
      if (mode === Mode.Practice || answered[currentQuestionIndex]) {
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
                .map((a, i) => (a.result === true ? i : undefined))
                .filter((n) => n !== undefined);
              setAnswered({
                ...answered,
                [currentQuestionIndex]: {
                  selectedMultiple: updatedAnswer,
                  isCorrect: JSON.stringify(correctAnswer) === JSON.stringify(updatedAnswer),
                },
              });

              setDone(true);
              setTimeout(() => changeQuestion(true), 450);
            }
          }
        }
      } else {
        if (selected === -1) {
          setSelected(index);
          setDone(true);
          if (result === true) {
            setColor(STYLE.FONT_CORRECT_COLOR);
          } else {
            setColor(STYLE.FONT_INCORRECT_COLOR);
          }

          setAnswered({
            ...answered,
            [currentQuestionIndex]: {
              selected: index,
              isCorrect: result,
            },
          });
        }
        setTimeout(() => changeQuestion(true), 450);
      }
    }, 50);
  };

  const AllAnswers: React.FC = () => (
    <AnswerContainer>
      {currentQuestion.answers.map((answer, currentAnswerIndex) => {
        const { fontColor, fontWeight, isSelected } = styleAnswer(
          answer,
          currentQuestion,
          answered,
          done,
          mode,
          color,
          selected,
          selectedAnswers,
          currentQuestionIndex,
          currentAnswerIndex
        );

        return (
          <AnswerText
            key={`answer-${currentAnswerIndex}`}
            style={{ color: fontColor, fontWeight }}
            onClick={() => (isSelected ? null : handleClickAnswer(currentAnswerIndex, answer.result))}
          >
            {`${QuestionPrefix[currentAnswerIndex + 1]}. ${answer.text}`}
          </AnswerText>
        );
      })}
    </AnswerContainer>
  );

  return (
    <Container>
      <Select
        variant="outlined"
        sx={{
          width: 100,
          height: 40,
          marginRight: 15,
          color: STYLE.FONT_COLOR_NORMAL,
          '& .MuiSvgIcon-root': {
            color: 'white',
          },
        }}
        value={certificate}
        label="Certificate"
        onChange={(e) => setCertificate(Number(e.target.value))}
      >
        <MenuItem value={1}>AZ204</MenuItem>
        <MenuItem value={2}>AZ900</MenuItem>
      </Select>
      <TopContainer>
        <IconButton
          aria-label="Previous"
          component="label"
          onClick={() => changeQuestion(false)}
          disabled={currentQuestionIndex === 0}
          style={{ color: STYLE.FONT_CORRECT_COLOR }}
        >
          <ChevronLeft style={{ width: 50, height: 50 }} />
        </IconButton>
        <Heading>
          <span style={{ color: STYLE.FONT_CORRECT_COLOR, fontWeight: STYLE.FONT_WEIGHT_BOLD }}>{`${
            currentQuestionIndex + 1
          }`}</span>
          {`/${totalQuestion} `}
        </Heading>
        <IconButton
          aria-label="Next"
          component="label"
          onClick={() => changeQuestion(true)}
          disabled={currentQuestionIndex + 1 === totalQuestion}
          style={{ color: STYLE.FONT_CORRECT_COLOR }}
        >
          <ChevronRight style={{ width: 50, height: 50 }} />
        </IconButton>
      </TopContainer>
      <QuestionText key={currentQuestion.question} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span style={{ color: STYLE.FONT_CORRECT_COLOR }}>
          ({currentQuestion.isMultiple ? '多' : '單'}选题)
        </span>
        Q{currentQuestionIndex + 1}. {currentQuestion.question}
      </QuestionText>
      <AllAnswers />
      <Label
        control={
          <StyledSwitch
            color="primary"
            checked={mode === Mode.Practice}
            onChange={() => setMode(mode === Mode.Practice ? Mode.Normal : Mode.Practice)}
          />
        }
        label="练习"
      />
      <Label control={<StyledSwitch color="primary" checked={openModal} onChange={handleOpen} />} label="答题历史" />
      <Label
        control={<StyledSwitch color="primary" checked={mode === Mode.Revision} onChange={handleRevision} />}
        label="错题集"
      />
      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <AnsweredList
          handleQuestionOnclick={(number) => {
            setOpenModal(false);
            setCurrentCurrentQuestionIndex(number);
          }}
          totalQuestions={totalQuestion}
          answered={answered}
        />
      </Modal>
    </Container>
  );
};

const Label = styled(FormControlLabel)({
  marginTop: 20,
  color: STYLE.FONT_COLOR_NORMAL,
  whiteSpace: 'pre-line',
  '@media only screen and (max-width: 600px)': {
    marginTop: 10,
    marginBottom: 10,
  },
});
const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-track': {
    backgroundColor: STYLE.SWITCH_COLOR,
  },
});
export const Text = styled(motion.div)({
  textAlign: 'left',
  fontSize: 20,
  color: STYLE.FONT_COLOR_NORMAL,
  whiteSpace: 'pre-line',
});
const QuestionText = styled(Text)({
  fontSize: 20,
});
const AnswerContainer = styled('div')({
  marginTop: 20,
  paddingBottom: 50,
});
export const Heading = styled(Text)({
  fontWeight: 400,
});
const AnswerText = styled(Text)({
  cursor: 'default',
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
