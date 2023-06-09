import {
  styled,
  IconButton,
  Switch,
  FormControlLabel,
  Modal,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Box,
  Typography,
  FormControl,
  Autocomplete,
  TextField,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Close, Delete } from "@mui/icons-material";
import { Container } from "@mui/system";
import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";

import { Mode, QuestionPrefix, THEME } from "../../constant";
import az900 from "../../data/questions_1.json";
import az204 from "../../data/questions_2.json";

import {
  Answered,
  AnsweredChild,
  Dropdown,
  Question,
  QuestionPart,
  QuestionType,
  StyledButtonProps,
  StyledComponentProps,
  ThemeOption,
} from "../../types/type";
import { Link, useSearchParams } from "react-router-dom";
import AnsweredList from "../AnswerHistory";
import { isThemeOption, removeKeywords, styleAnswer } from "./utils";
import React from "react";
import SearchBar from "../SearchBar";

/**
 * 1 normal
 * 2 practice
 * 3 revision
 * @returns
 */

export const Exam = () => {
  const [certificate, setCertificate] = useState<number>(1);
  const [openModal, setOpenModal] = useState(false);
  const [allowAutoNextQuestion, setAllowAutoNextQuestion] = useState(true);
  const [searchParams] = useSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(
    Number(searchParams.get("q") || 1) - 1
  );
  const [selected, setSelected] = useState<number>(-1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [themeOption, setThemeOption] = useState<ThemeOption>(
    isThemeOption(searchParams.get("theme"))
      ? (searchParams.get("theme") as ThemeOption)
      : "LIGHT"
  );
  const [color, setColor] = useState(THEME[themeOption].FONT_COLOR_NORMAL);
  const [done, setDone] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [answered, setAnswered] = useState<Answered>({});
  const [mode, setMode] = useState<Mode>(1);
  const [incorrects, setIncorrects] = useState<Question[]>([]);

  const certs = useMemo(
    () => ({
      0: incorrects,
      1: az204,
      2: az900,
    }),
    [incorrects]
  );

  const allQuestion = useMemo(() => {
    const questions = certs[certificate as keyof typeof certs] as Question[];
    const keywords = [
      /[{}"]/g,
      /correctOrder:\[\d+(,\d+)*\]/,
      "type:1",
      "type:2",
      "type:3",
      "type:4",
      "text:",
      "result:true",
      "result:false",
      "question:",
      ",sentences:",
      ",options:",
      "parts:",
      ",answers:\\[Yes(,|,\\s)?(,|,\\s)?No(,|,\\s)?\\]",
      /\n/,
      /totalAnswer:\d+/g,
      /correct:\d+/g,
    ];

    return questions.map((q) => removeKeywords(JSON.stringify(q), keywords));
  }, [certs, certificate]);

  const loadQuestion = (number: number) =>
    (certs[certificate as keyof typeof certs] as Question[])[number];

  const totalQuestion = certs[certificate as keyof typeof certs].length;
  const currentQuestion = loadQuestion(currentQuestionIndex);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleRevision = () => {
    if (mode !== Mode.Revision) {
      const allIncorrects: Question[] = Object.entries(answered)
        .filter(([_, val]: [string, AnsweredChild]) => {
          const { answeredDropdown, isCorrect } = val;

          if (answeredDropdown) {
            return Object.values(answeredDropdown).some(
              (ad: Dropdown) => ad.isCorrect === false
            );
          }

          return isCorrect === false;
        })
        .map(([key]) => loadQuestion(Number(key)));

      if (allIncorrects.length === 0) {
        return;
      }
      setAnswered({});
      setTimeout(() => {
        setCurrentQuestionIndex(0);
        setIncorrects(allIncorrects);
        setMode(Mode.Revision);
        setCertificate(0);
      }, 200);
    } else {
      setMode(Mode.Normal);
    }
  };

  const changeQuestion = (isNext: boolean) => {
    if (isNext && currentQuestionIndex + 1 === totalQuestion) {
      return;
    }

    setDone(false);
    setSelected(-1);
    setSelectedAnswers([]);
    setColor(THEME[themeOption].FONT_SELECTED_COLOR);

    if (!isNext && currentQuestionIndex !== 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }

    if (isNext) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleClickAnswer = (index: number, result?: boolean) => {
    setTimeout(() => {
      if (mode === Mode.Practice || answered[currentQuestionIndex]) {
        return;
      }

      if (currentQuestion.type === QuestionType.Multiple) {
        if (!done) {
          if (selectedAnswers.length === 0) {
            setSelectedAnswers([index]);
          } else {
            const updatedAnswer = [...selectedAnswers, index].sort();
            setSelectedAnswers(updatedAnswer);
            if (updatedAnswer.length === currentQuestion.totalAnswer) {
              const correctAnswer = (currentQuestion.answers || [])
                .map((a, i) => (a.result === true ? i : undefined))
                .filter((n) => n !== undefined);
              setAnswered({
                ...answered,
                [currentQuestionIndex]: {
                  selectedMultiple: updatedAnswer,
                  isCorrect:
                    JSON.stringify(correctAnswer) ===
                    JSON.stringify(updatedAnswer),
                },
              });

              setDone(true);
              if (allowAutoNextQuestion) {
                setTimeout(() => changeQuestion(true), 450);
              }
            }
          }
        }
      } else if (currentQuestion.type === QuestionType.Single) {
        if (selected === -1) {
          setSelected(index);
          setDone(true);
          if (result === true) {
            setColor(THEME[themeOption].FONT_CORRECT_COLOR);
          } else {
            setColor(THEME[themeOption].FONT_INCORRECT_COLOR);
          }

          setAnswered({
            ...answered,
            [currentQuestionIndex]: {
              selected: index,
              isCorrect: result,
            },
          });
        }
        if (allowAutoNextQuestion) {
          setTimeout(() => changeQuestion(true), 450);
        }
      }
    }, 10);
  };

  const handleDropdownSelcted = (
    event: SelectChangeEvent<unknown>,
    index: number,
    dropdownCount: number,
    part: QuestionPart
  ) => {
    const selected = Number(event.target.value);
    let myDropdown = answered[currentQuestionIndex]?.answeredDropdown;

    if (myDropdown !== undefined) {
      myDropdown[index] = {
        selected,
        isCorrect: part.correct === selected,
      };
    } else {
      myDropdown = {
        [index]: {
          selected,
          isCorrect: part.correct === selected,
        },
      };
    }

    setAnswered({
      ...answered,
      [currentQuestionIndex]: {
        answeredDropdown: myDropdown,
      },
    });

    if (Object.values(myDropdown).length === dropdownCount) {
      setDone(true);
      if (allowAutoNextQuestion) {
        setTimeout(() => changeQuestion(true), 700);
      }
    }
  };

  const handleOptionSelected = (
    index: number,
    totalOptions?: number,
    correctOrder?: number[]
  ) => {
    let myselectedMatch = answered[currentQuestionIndex]?.selectedMatch;
    let isCorrect: boolean | undefined = undefined;

    if (myselectedMatch !== undefined) {
      myselectedMatch.push(index);
    } else {
      myselectedMatch = [index];
    }

    if (myselectedMatch.length === correctOrder?.length) {
      isCorrect =
        JSON.stringify(correctOrder) === JSON.stringify(myselectedMatch);
    }

    setAnswered({
      ...answered,
      [currentQuestionIndex]: {
        selectedMatch: myselectedMatch,
        isCorrect,
      },
    });

    if (isCorrect !== undefined) {
      setDone(true);
      if (allowAutoNextQuestion) {
        setTimeout(() => changeQuestion(true), 700);
      }
    }
  };

  const handleOptionToBeRemoved = (indexToRemove: number) => {
    let myselectedMatch = answered[currentQuestionIndex]?.selectedMatch;

    if (myselectedMatch === undefined) {
      return;
    }

    myselectedMatch.splice(indexToRemove, 1);

    setAnswered({
      ...answered,
      [currentQuestionIndex]: {
        selectedMatch: myselectedMatch,
      },
    });
  };

  const DragQuestion: React.FC = () => {
    const finished = answered[currentQuestionIndex]?.isCorrect !== undefined;

    return (
      <MatchQuestionContainer>
        <ColumnBox sx={{ maxWidth: 800, mt: 0.5 }}>
          {(currentQuestion.options || []).map((option, index) => (
            <StyledButton
              key={index}
              themeOption={themeOption}
              variant="outlined"
              onClick={() => {
                if (finished || mode === Mode.Practice) {
                  return;
                }
                handleOptionSelected(
                  index,
                  currentQuestion.options?.length,
                  currentQuestion.correctOrder
                );
              }}
            >
              {option}
            </StyledButton>
          ))}
        </ColumnBox>
        <ColumnBox sx={{ mt: 0.5 }}>
          {currentQuestion.sentences?.map((sentence, index) => (
            <Typography
              key={index}
              variant="body1"
              sx={{
                py: 1,
                mb: 0.5,
                color: THEME[themeOption].FONT_COLOR_NORMAL,
              }}
            >
              {sentence}
            </Typography>
          ))}
        </ColumnBox>
        <ColumnBox sx={{ mt: 0.5 }}>
          {mode === Mode.Practice
            ? (currentQuestion.correctOrder || []).map((order, index) => {
                let color = THEME[themeOption].DROPDOWN_CORRECT_COLOR;

                return (
                  <StyledButton
                    key={index}
                    variant="outlined"
                    color="primary"
                    background={color}
                    themeOption={themeOption}
                  >
                    {(currentQuestion.options || [])[order]}
                  </StyledButton>
                );
              })
            : ((answered[currentQuestionIndex] || {}).selectedMatch || []).map(
                (order, index) => {
                  let color: string | undefined = undefined;
                  let isCorrect: boolean | undefined = undefined;

                  if (finished) {
                    const { correctOrder } = currentQuestion;

                    if (correctOrder) {
                      if (correctOrder[index] === order) {
                        isCorrect = true;
                        color = THEME[themeOption].DROPDOWN_CORRECT_COLOR;
                      } else {
                        isCorrect = false;
                        color = THEME[themeOption].DROPDOWN_INCORRECT_COLOR;
                      }
                    }
                  }

                  return (
                    <>
                      <StyledButton
                        key={index}
                        variant="outlined"
                        color="primary"
                        background={color}
                        themeOption={themeOption}
                        onClick={() =>
                          !finished ? handleOptionToBeRemoved(index) : null
                        }
                      >
                        {(currentQuestion.options || [])[order]}
                      </StyledButton>
                      {!isCorrect && finished && (
                        <span
                          style={{
                            color: THEME[themeOption].FONT_COLOR_NORMAL,
                          }}
                        >
                          {
                            (currentQuestion.options || [])[
                              (currentQuestion.correctOrder || [])[index]
                            ]
                          }
                        </span>
                      )}
                    </>
                  );
                }
              )}
        </ColumnBox>
      </MatchQuestionContainer>
    );
  };

  const DropdownQuestion: React.FC = () => (
    <AnswerContainer>
      <>
        {(currentQuestion.parts || []).map((part, index) => {
          if (typeof part === "string") {
            return (
              <AnswerText themeOption={themeOption} key={part}>
                {part}
              </AnswerText>
            );
          }
          const dropdownCount = (currentQuestion.parts || []).filter(
            (part) => typeof part !== "string"
          ).length;

          const currentDropdowns =
            ((answered || [])[currentQuestionIndex] || {}).answeredDropdown ||
            {};

          const currentDropdown = currentDropdowns[index];
          const finished =
            Object.values(currentDropdowns).length === dropdownCount;
          const currentDropdownColor =
            (mode === Mode.Practice ||
              (finished && currentDropdown?.isCorrect)) === true
              ? THEME[themeOption].DROPDOWN_CORRECT_COLOR
              : finished && currentDropdown?.isCorrect === false
              ? THEME[themeOption].DROPDOWN_INCORRECT_COLOR
              : THEME[themeOption].DROPDOWN_BACKGROUND_COLOR_NORMAL;
          return (
            <FormControl sx={{ minWidth: 250 }}>
              <Select
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#000000",
                  },
                }}
                key={part.options[0]}
                value={
                  mode === Mode.Practice
                    ? part.correct
                    : currentDropdown?.selected ?? -1
                }
                onChange={(event: SelectChangeEvent<unknown>) =>
                  handleDropdownSelcted(event, index, dropdownCount, part)
                }
                style={{
                  background:
                    currentDropdownColor ||
                    THEME[themeOption].DROPDOWN_BACKGROUND_COLOR_NORMAL,
                }}
              >
                <MenuItem value={-1} disabled>
                  Select
                </MenuItem>
                {part.options.map((option, index) => (
                  <MenuItem
                    key={index}
                    value={index}
                    disabled={mode === Mode.Practice || finished}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>

              {part.options
                .filter(
                  (_, index) =>
                    index === part.correct &&
                    currentDropdown?.isCorrect === false &&
                    finished
                )
                .map((option) => (
                  <>
                    <br />
                    <span
                      style={{
                        color: THEME[themeOption].FONT_CORRECT_ANSWER_COLOR,
                        fontWeight: THEME[themeOption].FONT_WEIGHT_BOLD,
                      }}
                    >
                      [{part.correct + 1}] - {option}
                    </span>
                  </>
                ))}
            </FormControl>
          );
        })}
      </>
    </AnswerContainer>
  );

  const SelectQuestion: React.FC = () => (
    <AnswerContainer>
      {(currentQuestion.answers || []).map((answer, currentAnswerIndex) => {
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
          currentAnswerIndex,
          themeOption
        );

        return (
          <AnswerText
            themeOption={themeOption}
            key={`answer-${currentAnswerIndex}`}
            style={{ color: fontColor, fontWeight }}
            onClick={() =>
              isSelected
                ? null
                : handleClickAnswer(currentAnswerIndex, answer.result)
            }
          >
            {`${QuestionPrefix[currentAnswerIndex + 1]}. ${answer.text}`}
          </AnswerText>
        );
      })}
    </AnswerContainer>
  );

  const QuestionAndAnswerArea: React.FC = () => {
    switch (currentQuestion.type) {
      case QuestionType.Match:
        return <DragQuestion />;
      case QuestionType.Dropdown:
        return <DropdownQuestion />;
      default:
        return <SelectQuestion />;
    }
  };

  const removeAnswer = () => {
    const updatedAnswered = { ...answered };
    delete updatedAnswered[currentQuestionIndex];
    setAnswered(updatedAnswered);
  };

  const handleSuggestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    setMode(Mode.Practice);
  };

  return (
    <Container
      sx={{
        width:'90%',
        background: THEME[themeOption].BACKGROUND_COLOR_NORMAL,
        height: "100vh",
      }}
    >
      <div>
        <SearchBar
          certificate={certificate}
          keyword={keyword}
          onSuggestionClick={handleSuggestionClick}
          data={allQuestion}
          setKeyword={(keyword) => setKeyword(keyword)}
        />

        <>
          <Select
            variant="outlined"
            sx={{
              width: 130,
              height: 40,
              color: THEME[themeOption].FONT_COLOR_NORMAL,
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}
            value={certificate}
            label="Certificate"
            onChange={(e) => {
              setAnswered({});
              setCurrentQuestionIndex(0);
              setTimeout(() => {
                setCertificate(Number(e.target.value));
                setMode(Mode.Normal);
              }, 300);
            }}
          >
            <MenuItem value={0} disabled>
              Revision
            </MenuItem>
            <MenuItem value={1}>AZ204</MenuItem>
            <MenuItem value={2}>AZ900</MenuItem>
          </Select>
          <Button variant="contained" onClick={removeAnswer} color="primary">
            Reset Question
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              setAnswered({});
              setCurrentQuestionIndex(0);
            }}
          >
            Reset All
          </Button>
        </>
        <Link to="/#question" />
        <TopContainer>
          <IconButton
            aria-label="Previous"
            component="label"
            onClick={() => changeQuestion(false)}
            disabled={currentQuestionIndex === 0}
            style={{ color: THEME[themeOption].FONT_CORRECT_COLOR }}
          >
            <ChevronLeft style={{ width: 50, height: 50 }} />
          </IconButton>
          <Heading themeOption={themeOption}>
            <span
              style={{
                color: THEME[themeOption].FONT_CORRECT_COLOR,
                fontWeight: THEME[themeOption].FONT_WEIGHT_BOLD,
              }}
            >{`${currentQuestionIndex + 1}`}</span>
            {`/${totalQuestion} `}
          </Heading>
          <IconButton
            aria-label="Next"
            component="label"
            onClick={() => changeQuestion(true)}
            disabled={currentQuestionIndex + 1 === totalQuestion}
            style={{ color: THEME[themeOption].FONT_CORRECT_COLOR }}
          >
            <ChevronRight style={{ width: 50, height: 50 }} />
          </IconButton>
        </TopContainer>
        <Text
          themeOption={themeOption}
          key={currentQuestion.question}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {currentQuestion.image ? (
            <>
              <img src={currentQuestion.image} alt="Question" />
              <br />
            </>
          ) : null}
          <span style={{ color: THEME[themeOption].FONT_CORRECT_COLOR }}>
            {currentQuestion.type === QuestionType.Multiple
              ? "(多选题)"
              : currentQuestion.type === QuestionType.Single
              ? "(單选题)"
              : ""}
            &nbsp;
          </span>
          Q{currentQuestionIndex + 1}. {currentQuestion.question}
        </Text>
        <QuestionAndAnswerArea />
        <Label
          themeOption={themeOption}
          control={
            <StyledSwitch
              themeOption={themeOption}
              color="primary"
              checked={mode === Mode.Practice}
              onChange={() =>
                setMode(mode !== Mode.Practice ? Mode.Practice : Mode.Normal)
              }
            />
          }
          label="练习"
        />
        <Label
          themeOption={themeOption}
          control={
            <StyledSwitch
              themeOption={themeOption}
              color="primary"
              checked={allowAutoNextQuestion}
              onChange={() => setAllowAutoNextQuestion(!allowAutoNextQuestion)}
            />
          }
          label="自动切换"
        />
        <Label
          themeOption={themeOption}
          control={
            <StyledSwitch
              themeOption={themeOption}
              color="primary"
              checked={openModal}
              onChange={handleOpen}
            />
          }
          label="选题"
        />
        <Label
          themeOption={themeOption}
          control={
            <StyledSwitch
              themeOption={themeOption}
              color="primary"
              checked={mode === Mode.Revision}
              onChange={handleRevision}
            />
          }
          label="错题集"
        />
        <Label
          themeOption={themeOption}
          control={
            <StyledSwitch
              themeOption={themeOption}
              color="primary"
              checked={themeOption === "DARK"}
              onChange={() =>
                setThemeOption(themeOption === "DARK" ? "LIGHT" : "DARK")
              }
            />
          }
          label="夜間模式"
        />
        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <AnsweredList
            themeOption={themeOption}
            handleQuestionOnclick={(number) => {
              setOpenModal(false);
              setCurrentQuestionIndex(number);
            }}
            totalQuestions={totalQuestion}
            answered={answered}
          />
        </Modal>
      </div>
    </Container>
  );
};

const MatchQuestionContainer = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  marginY: 2,
});

const ColumnBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  marginRight: 5,
});

const StyledButton = styled(Button)<StyledButtonProps>(
  ({ themeOption, background }) => ({
    marginBottom: 1,
    textAlign: "left",
    justifyContent: "flex-start",
    textTransform: "none",
    fontWeight: 500,
    fontSize: 16,
    background,
    color: THEME[themeOption].FONT_COLOR_NORMAL,
    border: "2px solid rgba(25, 118, 210, 0.5)",
    "&:hover": {
      border: "2px solid rgba(25, 118, 210, 0.5) !important",
      background: "transparent !important",
    },
    whiteSpace: 'pre-line', // Preserve line breaks
    userSelect: "text",
    "-moz-user-select": "text",
    "-webkit-user-select": "text",
    "-ms-user-select": "text",
  })
);

const Label = styled(FormControlLabel)<StyledComponentProps>(
  ({ themeOption }) => ({
    marginTop: 20,
    color: THEME[themeOption].FONT_COLOR_NORMAL,
    whiteSpace: "pre-line",
    "@media only screen and (max-width: 600px)": {
      marginTop: 10,
      marginBottom: 10,
    },
  })
);
const StyledSwitch = styled(Switch)<StyledComponentProps>(
  ({ themeOption }) => ({
    "& .MuiSwitch-track": {
      backgroundColor: THEME[themeOption].SWITCH_COLOR,
    },
  })
);
export const Text = styled(motion.div)<StyledComponentProps>(
  ({ themeOption }) => ({
    textAlign: "left",
    fontSize: 20,
    color: THEME[themeOption].FONT_COLOR_NORMAL,
    whiteSpace: "pre-line",
    "@media only screen and (max-width: 600px)": {
      fontSize: 18,
    },
  })
);
const AnswerContainer = styled("div")({
  marginTop: 20,
  paddingBottom: 50,
});
export const Heading = styled(Text)({
  fontWeight: 400,
});
const AnswerText = styled(Text)({
  cursor: "default",
  marginLeft: 5,
  marginTop: 10,
  borderRadius: 5,
  "@media only screen and (max-width: 600px)": {
    fontSize: 17,
  },
});
const TopContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});
