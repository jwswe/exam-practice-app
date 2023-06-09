import { Exam } from "./views/Exam";

import { Routes, Route } from "react-router-dom";
import { Importer } from "./views/QuestionImporter";

function App() {
  return (
    <Routes>
      <Route path="/exam" element={<Exam />} />
      <Route path="/import" element={<Importer />} />
    </Routes>
  );
}

export default App;
