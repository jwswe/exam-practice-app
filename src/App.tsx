import { Exam } from './views/exam';
import './App.css';

import { Routes, Route } from 'react-router-dom';
import { Importer } from './views/importer';

function App() {
  return (
    <div className="container">
      <header className="header"></header>

      <main className="main">
        <Routes>
          <Route path="/exam" element={<Exam />} />
          <Route path="/import" element={<Importer />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
