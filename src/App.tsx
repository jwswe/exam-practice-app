import { Exam } from './views/Exam';
import './App.css';

import { Routes, Route } from 'react-router-dom';
import { Importer } from './views/QuestionImporter';

function App() {
  return (
    <div className="container">
      <header className="header"></header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Exam />} />
          <Route path="/import" element={<Importer />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
