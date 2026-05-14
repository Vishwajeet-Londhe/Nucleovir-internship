import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Processing from './pages/Processing';
import Explanation from './pages/Explanation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/processing/:paperId" element={<Processing />} />
        <Route path="/explanation/:paperId" element={<Explanation />} />
      </Routes>
    </Router>
  );
}

export default App;
