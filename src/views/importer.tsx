import { useState } from 'react';
import { Form } from 'react-bootstrap';

export const Importer = () => {
  const [lines, setLines] = useState<number>(0);
  const [question, setQuestion] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);

  return (
    <Form style={{ padding: 20 }}>
      <Form.Group className="mb-3" controlId="formGroupEmail">
        <Form.Label>Question and Answers</Form.Label>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <Form.Control
            style={{ marginTop: 5 }}
            as="textarea"
            rows={5}
            type="default"
            placeholder="Answers"
            onChange={(e) => {
              if (e.target.value) {
                const lines = e.target.value.split('\n');
                const count = lines.length;
                if (count) {
                  setLines(count);
                }
              }
            }}
          />
          <div>
            {[...Array(lines)].map((_, i) => {
              if (i === 0) {
                return <div>　</div>;
              } else {
                return <Form.Check style={{ flex: 4, marginLeft: 10 }} type="checkbox" label="Correct"></Form.Check>;
              }
            })}
          </div>
        </div>
      </Form.Group>
    </Form>
  );
};
