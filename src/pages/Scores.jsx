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
        if (Array.isArray(parsed)) {
          setScores(parsed);
        }
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
    <div className="page">
      <h2>{filterTestName ? `Scores for "${filterTestName}"` : "Past Scores"}</h2>

      {displayScores.length === 0 ? (
        <p>No scores logged yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Section</th>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Test Name</th>
              <th style={thStyle}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {displayScores.map(
              ({ id, date, section, score, totalScore, mathScore, englishScore, testName }) => (
                <tr key={id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tdStyle}>{date || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{section || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {score !== undefined
                      ? score
                      : totalScore !== undefined
                      ? `Total: ${totalScore} (M: ${mathScore}, E: ${englishScore})`
                      : "—"}
                  </td>
                  <td style={tdStyle}>
                    <Link to={`/questions?testName=${encodeURIComponent(testName || "")}`}>
                      {testName || "Untitled"}
                    </Link>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(id)}
                      style={{
                        color: "red",
                        border: "none",
                        background: "transparent",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "2px solid #ccc",
};

const tdStyle = {
  padding: "0.75rem",
};
