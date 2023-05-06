import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Answer, Question } from '../../types/type';

export const Importer = () => {
  const [lines, setLines] = useState<number>(0);
  const [question, setQuestion] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [corrects, setCorrects] = useState<{ [key: number]: boolean }>({});
  const [output, setOutput] = useState<Question[]>([]);

  return (
    <div style={{ padding: 20 }}>
      <Form>
        <Form.Group className="mb-3" controlId="formGroupEmail">
          <Form.Label>Question and Answers</Form.Label>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <Form.Control
              style={{ marginTop: 5 }}
              as="textarea"
              rows={10}
              type="default"
              placeholder="contents..."
              value={content}
              onChange={(e) => {
                if (e.target.value) {
                  let text = e.target.value.replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, "\n");
                  setContent(text);
                  const lines = text.split('\n');

                  const count = lines.length;
                  if (count) {
                    setLines(count);
                  }

                  lines.forEach((l, i) => {
                    if (i === 0) {
                      setQuestion(l);
                    } else if (i > 0) {
                      setAnswers((answers) => [...answers, l]);
                    }
                  });
                } else {
                  setLines(0);
                }
              }}
            />
            <div>
              {[...Array(lines)].map((_, i) => {
                if (i === 0) {
                  return <div>　</div>;
                } else {
                  let check = false;
                  return (
                    <Form.Check
                      style={{ flex: 4, marginLeft: 10 }}
                      type="checkbox"
                      label="Correct"
                      checked={corrects[i - 1] === true}
                      onChange={(e) => {
                        let myCorrect = Object.assign({}, corrects);
                        if (myCorrect[i - 1]) {
                          myCorrect[i - 1] = false;
                          if (!Object.values(myCorrect).find((c) => c === true)) {
                            myCorrect = {};
                          }
                        } else {
                          myCorrect[i - 1] = true;
                        }
                        setCorrects(myCorrect);
                      }}
                    ></Form.Check>
                  );
                }
              })}
            </div>
          </div>
        </Form.Group>
      </Form>
      <Button
        disabled={!Object.values(corrects).length}
        onClick={() => {
          const correctAnswers = Object.values(corrects).length;
          if (question && answers.length && correctAnswers) {
            const resAnswers: Answer[] = answers.map((a, i) => {
              return {
                text: a,
                result: corrects[i] === true ? true : false,
              };
            });
            const res: Question = {
              question,
              answers: resAnswers,
              isMultiple: correctAnswers > 1 ? true : undefined,
              totalAnswer: correctAnswers > 1 ? correctAnswers : undefined,
            };

            setOutput((output) => [...output, res]);
            setLines(0);
            setQuestion('');
            setAnswers([]);
            setCorrects({});
            setContent('');
          }
        }}
      >
        Submit
      </Button>

      {output.length > 0 && <Form.Control style={{ marginTop: 5 }} as="textarea" rows={10} value={JSON.stringify(output)} />}
    </div>
  );
};
