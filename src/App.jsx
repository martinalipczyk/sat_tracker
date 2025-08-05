import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Scores from "./pages/Scores";
import Questions from "./pages/Questions";
import Test from "./pages/Test";
import TestResults from "./pages/TestResults";


export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test/results" element={<TestResults />} />

        </Routes>
      </Layout>
    </Router>
  );
}
