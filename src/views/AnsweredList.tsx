import { Box, List, styled } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useMemo } from 'react';
import { Answered } from '../types/type';
import { Heading } from './exam';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 550,
  bgcolor: 'rgb(0, 30, 60)',
  border: '1px solid #000',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

interface AnsweredListProps {
  totalQuestions: number;
  answered: Answered;
  handleQuestionOnclick: (questionNumber: number) => void;
}

const AnsweredList: React.FC<AnsweredListProps> = ({ totalQuestions, answered, handleQuestionOnclick }) => {
  const Circle = styled('div')({
    cursor: 'pointer',
    height: '30px',
    width: '30px',
    borderRadius: '50%',
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 15,
    fontWeight: 500,
    ' -webkit-touch-callout': 'none',
    '-webkit-user-select': 'none',
    '-khtml-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
  });

  const ListContainer = styled(List)({
    marginTop: 20,
    overflow: 'hidden',
    maxHeight: 600,
    '&:hover': {
      overflowY: 'overlay',
    },
  });

  const AnswerList = useMemo(() => {
    const answers = [];
    for (let i = 0; i < totalQuestions; i++) {
      let background = '#bbb';

      if (answered[i]) {
        const isCorrect = answered[i].isCorrect;
        if (isCorrect === true) background = '#307F41';
        if (isCorrect === false) background = '#DE4A4A';
      }

      answers.push(
        <Grid key={`answer-${i}`} paddingX={5} item xs={3} display="flex" direction="row" justifyContent="center">
          <Circle onClick={() => handleQuestionOnclick(i)} style={{ background }}>
            {i + 1}
          </Circle>
        </Grid>
      );
    }
    return (
      <Grid container spacing={3}>
        {answers}
      </Grid>
    );
  }, [totalQuestions, Circle, answered, handleQuestionOnclick]);

  return (
    <Box sx={style}>
      <Heading>Answer History</Heading>

      <ListContainer>{AnswerList}</ListContainer>
    </Box>
  );
};

export default React.memo(AnsweredList);
