import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Scores() {
  const [scores, setScores] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("scores");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setScores(parsed);
      } catch (err) {
        console.error("Error parsing scores:", err);
      }
    }
  }, []);

  const params = new URLSearchParams(location.search);
  const filterTestName = params.get("testName");
  const displayScores = filterTestName
    ? scores.filter((s) => s.testName === filterTestName)
    : scores;

  const handleDelete = (id) => {
    const updated = scores.filter((s) => s.id !== id);
    setScores(updated);
    localStorage.setItem("scores", JSON.stringify(updated));
  };

  return (
    <div className="page scores-page">
      <header className="scores-header">
        <h2 className="scores-title">
          {filterTestName ? `Scores for “${filterTestName}”` : "Past Scores"}
        </h2>
      </header>

      {displayScores.length === 0 ? (
        <div className="card empty-state">
          <h3>No scores yet</h3>
          <p className="muted">
            When you complete a practice test, results will appear here.
          </p>
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th className="center">Section</th>
                <th className="center">Score</th>
                <th>Test Name</th>
                <th className="center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {displayScores.map(
                ({ id, date, section, score, totalScore, mathScore, englishScore, testName }) => (
                  <tr key={id}>
                    <td>{date || "—"}</td>
                    <td className="center">
                      {section ? (
                        <span className="badge">{section}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="center">
                      {score !== undefined
                        ? score
                        : totalScore !== undefined
                        ? (
                            <span className="score-split">
                              <span className="score-total">Total: {totalScore}</span>
                              <span className="score-part">M: {mathScore ?? "—"}</span>
                              <span className="score-part">E: {englishScore ?? "—"}</span>
                            </span>
                          )
                        : "—"}
                    </td>
                    <td>
                      <Link
                        className="link"
                        to={`/questions?testName=${encodeURIComponent(testName || "")}`}
                        title="View questions for this test"
                      >
                        {testName || "Untitled"}
                      </Link>
                    </td>
                    <td className="center">
                      <button
                        className="icon-btn danger"
                        aria-label="Delete score"
                        onClick={() => handleDelete(id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
