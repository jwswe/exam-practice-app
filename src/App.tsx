import { Exam } from './views/exam';
import './App.css';

import { Routes, Route } from 'react-router-dom';
import { Importer } from './views/importer';

function App() {
  return (
    <div className="container">
      <header className="header"></header>

      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossOrigin="anonymous"
      />

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
