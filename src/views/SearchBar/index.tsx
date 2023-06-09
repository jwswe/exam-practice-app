import React, { useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import { ListItem, ListItemButton, ListItemText, styled } from "@mui/material";
import { Close } from "@mui/icons-material";

import az900 from "../../data/questions_1.json";
import az204 from "../../data/questions_2.json";
import { Question } from "../../types/type";
import { QuestionPrefix } from "../../constant";

interface SearchBarProps {
  data: string[];
  keyword: string;
  onSuggestionClick: (index: number) => void;
  setKeyword: (keyword: string) => void;
  certificate: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  data,
  keyword,
  setKeyword,
  onSuggestionClick,
  certificate,
}) => {
  const [matchingData, setMatchingSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    const filteredSuggestions = data.filter((d) =>
      d.toLowerCase().includes(keyword.toLowerCase())
    );
    setMatchingSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (index: number) => {
    const suggestion = matchingData[index];
    const allQuestionIndex = data.indexOf(suggestion);
    onSuggestionClick(allQuestionIndex);
  };

  const certs = useMemo(
    () => ({
      1: az204,
      2: az900,
    }),
    []
  );

  const loadQuestion = (number: number) =>
    (certs[certificate as keyof typeof certs] as Question[])[number];

  const showAnswer = (suggestion: string) => {
    let answerString = "";
    const index = data.indexOf(suggestion);
    const question = loadQuestion(index);
    const { answers, correctOrder, parts } = question;

    if (answers && answers.length) {
      answers.forEach((a, i) => {
        if (a.result === true) {
          answerString += QuestionPrefix[i + 1];
        }
      });
    } else if (correctOrder) {
      answerString = JSON.stringify(correctOrder);
    } else if (parts && parts.length) {
      parts.forEach((p) => {
        if (typeof p !== "string") {
          answerString += p.correct;
        }
      });
    }
    return answerString;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: isFocused ? 150 : undefined,
        }}
      >
        <TextField
          label="Search"
          value={keyword}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <Close onClick={() => setKeyword("")} sx={{ ml: 2, fontSize: 30 }} />
      </div>

      {keyword && (
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            width: "100%",
            wordWrap: "break-word",
          }}
        >
          {matchingData.map((suggestion, index) => {
            let answers = "";

            if (matchingData.length <= 10) {
              answers = showAnswer(suggestion);
            }

            return (
              <ListItem
                key={index}
                component="div"
                style={{ border: "1px solid black", padding: 0 }}
              >
                <ListItemButton onClick={() => handleSuggestionClick(index)}>
                  <ListItemText
                    primary={`[${answers}] ${
                      suggestion.length > 140
                        ? suggestion.slice(0, 140)
                        : suggestion
                    }`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
