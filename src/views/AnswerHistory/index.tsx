import { Box, List, styled } from "@mui/material";
import Grid from "@mui/material/Grid";
import React, { useMemo } from "react";
import {
  AnsweredListProps,
  Dropdown,
} from "../../types/type";
import { Heading } from "../Exam";
import { THEME } from "../../constant";

const AnsweredList: React.FC<AnsweredListProps> = ({
  totalQuestions,
  answered,
  handleQuestionOnclick,
  themeOption,
}) => {
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40%",
    bgcolor: THEME[themeOption].SECOND_BACKGROUND_COLOR,
    border: "1px solid #000",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    "@media only screen and (max-width: 900px)": {
      width: "80%",
    },
    "@media only screen and (max-width: 600px)": {
      width: "80%",
    },
  };

  const Circle = styled("div")({
    cursor: "pointer",
    height: "10px",
    width: "10px",
    borderRadius: "50%",
    padding: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 15,
    fontWeight: 500,
    " -webkit-touch-callout": "none",
    "-webkit-user-select": "none",
    "-khtml-user-select": "none",
    "-moz-user-select": "none",
    "-ms-user-select": "none",
    "user-select": "none",
  });

  const ListContainer = styled(List)({
    marginTop: 20,
    overflow: "hidden",
    maxHeight: 600,
    "&:hover": {
      overflowY: "overlay",
    },

    "@media only screen and (max-width: 600px)": {
      maxHeight: 400,
    },
  });

  const AnswerList = useMemo(() => {
    const answers = [];

    for (let i = 0; i < totalQuestions; i++) {
      let background = THEME[themeOption].CIRCLE_NORMAL_COLOR;

      if (answered[i]) {
        let isCorrect = answered[i].isCorrect;

        const { answeredDropdown } = answered[i];

        if (answeredDropdown) {
          isCorrect = Object.values(answeredDropdown).some(
            (ad: Dropdown) => ad.isCorrect === true
          );
        }

        if (isCorrect === true)
          background = THEME[themeOption].FONT_CORRECT_COLOR;
        if (isCorrect === false)
          background = THEME[themeOption].FONT_INCORRECT_COLOR;
      }

      answers.push(
        <Grid
          key={`answer-${i}`}
          paddingLeft={2}
          item
          xs={3}
          display="flex"
          direction="row"
          justifyContent="center"
        >
          <Circle
            onClick={() => handleQuestionOnclick(i)}
            style={{ background }}
          >
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
  }, [totalQuestions, Circle, answered, handleQuestionOnclick, themeOption]);

  return (
    <Box sx={style}>
      <Heading themeOption={themeOption}>选题</Heading>
      <ListContainer>{AnswerList}</ListContainer>
    </Box>
  );
};

export default React.memo(AnsweredList);
