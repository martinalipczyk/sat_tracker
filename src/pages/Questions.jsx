// ✅ Revamped Questions.jsx with export to CSV and PDF
import { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components with Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);




export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

    const pdfRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wrongQuestions") || "[]");
    setQuestions(stored);
    const tags = new Set();
    stored.forEach(q => q.tags?.forEach(tag => tags.add(tag)));
    setAvailableTags([...tags]);
  }, []);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReviewed = (id) => {
    const updated = questions.map(q =>
      q.id === id ? { ...q, reviewed: !q.reviewed } : q
    );
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
  };

  const handleTagEdit = (id, newTags) => {
    const updated = questions.map(q =>
      q.id === id ? { ...q, tags: newTags.split(",").map(t => t.trim()).filter(Boolean) } : q
    );
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
    setEditingTagId(null);
  };

  const handleDeleteQuestion = (id) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
  };

  const filtered = questions.filter(q => {
    const matchesReview = onlyUnreviewed ? !q.reviewed : true;
    const matchesTag = selectedTag ? q.tags?.includes(selectedTag) : true;
    const matchesTest = selectedTest ? q.testName === selectedTest : true;
    const matchesSection = selectedSection ? q.section === selectedSection : true;
    return matchesReview && matchesTag && matchesTest && matchesSection;
  });

  const allTests = [...new Set(questions.map(q => q.testName))];
  const allSections = [...new Set(questions.map(q => q.section))];

  const exportToCSV = () => {
    const headers = ["Test Name", "Section", "Question", "User Answer", "Correct Answer", "Reviewed", "Tags"];
    const rows = filtered.map(q => [
      q.testName,
      q.section,
      q.question,
      q.userAnswer,
      q.correctAnswer,
      q.reviewed ? "Yes" : "No",
      q.tags?.join(";") || ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(x => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "filtered_questions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const [showPdfDiv, setShowPdfDiv] = useState(false);

const exportToPDF = async () => {
  setShowPdfDiv(true);
  // Wait for the div to be visible in the DOM
  await new Promise(resolve => setTimeout(resolve, 100));
  if (pdfRef.current) {
    await html2pdf().from(pdfRef.current).set({ margin: 0.5, filename: 'filtered_questions.pdf', html2canvas: { scale: 2 } }).save();
  }
  setShowPdfDiv(false);
};

  // Add these counts before the return statement
  const totalCount = filtered.length;
  const reviewedCount = filtered.filter(q => q.reviewed).length;
  const unreviewedCount = totalCount - reviewedCount;

  const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart) => {
    const { width } = chart;
    const { height } = chart;
    const ctx = chart.ctx;
    ctx.restore();

    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    const reviewed = chart.data.datasets[0].data[0];
    const percentage = Math.round((reviewed / total) * 100);

    const fontSize = (height / 140).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";

    const text = `${percentage}%`;
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;

    ctx.fillText(text, textX, textY);
    ctx.save();
  }
};

  return (
   <div className="page" style={{ maxWidth: "1000px", margin: "auto", padding: "2rem" }}>
    <h2 style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: 700 }}>
      📚 Review Questions
    </h2>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "2rem",
        marginBottom: "2rem"
      }}
    >
      {/* Filters Card */}
      <div
        style={{
          flex: "1 1 250px",
          background: "#fdfdfd",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}
      >
        <h4 style={{ marginBottom: "0.75rem" }}>🎯 Filters</h4>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          📘 Test:
          <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}
            style={{ width: "100%", padding: "0.4rem", marginTop: "0.2rem", borderRadius: "6px", border: "1px solid #ccc" }}>
            <option value="">All</option>
            {allTests.map(test => <option key={test} value={test}>{test}</option>)}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          📘 Section:
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
            style={{ width: "100%", padding: "0.4rem", marginTop: "0.2rem", borderRadius: "6px", border: "1px solid #ccc" }}>
            <option value="">All</option>
            {allSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          🏷️ Tag:
          <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}
            style={{ width: "100%", padding: "0.4rem", marginTop: "0.2rem", borderRadius: "6px", border: "1px solid #ccc" }}>
            <option value="">All</option>
            {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </label>

        <label style={{
          display: "flex", alignItems: "center",
          marginTop: "0.5rem",
          background: "#fff4f4",
          padding: "0.5rem",
          border: "1px solid #d32f2f",
          borderRadius: "6px",
          fontWeight: 500,
          color: "#d32f2f"
        }}>
          <input
            type="checkbox"
            checked={onlyUnreviewed}
            onChange={() => setOnlyUnreviewed(prev => !prev)}
            style={{ marginRight: "0.5rem" }}
          />
          Show only unreviewed
        </label>
      </div>

      {/* Stats Card */}
      <div
        style={{
          flex: "1 1 180px",
          background: "#f7f9fc",
          border: "1px solid #dbe1ec",
          borderRadius: "10px",
          padding: "1rem",
          fontSize: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}
      >
        <h4 style={{ marginBottom: "0.75rem" }}>📊 Stats</h4>
        <div><strong style={{ color: "#1976d2" }}>Total:</strong> {filtered.length}</div>
        <div><strong style={{ color: "#388e3c" }}>Reviewed:</strong> {filtered.filter(q => q.reviewed).length}</div>
        <div><strong style={{ color: "#d32f2f" }}>Unreviewed:</strong> {filtered.filter(q => !q.reviewed).length}</div>
      <div style={{ width: "140px", height: "140px", margin: "0 auto" }}>
        <Doughnut
            data={{
                labels: ['Reviewed', 'Unreviewed'],
                datasets: [{
                data: [
                    filtered.filter(q => q.reviewed).length,
                    filtered.filter(q => !q.reviewed).length
                ],
                backgroundColor: ['#4caf50', '#e57373']
                }]
            }}
            options={{
                plugins: {
                legend: { display: false },
                centerText: true  // enables our custom plugin
                },
                cutout: '60%'
            }}
            plugins={[centerTextPlugin]}
            />
        </div>
      </div>

      {/* Export Buttons */}
      <div style={{
        flex: "1 1 180px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: "0.75rem"
      }}>
        <h4 style={{ marginBottom: "0.5rem" }}>📁 Export</h4>
        <button
          onClick={exportToCSV}
          style={{ backgroundColor: "#dcedc8", border: "1px solid #aed581", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          📤 CSV
        </button>
        <button
          onClick={exportToPDF}
          style={{ backgroundColor: "#b3e5fc", border: "1px solid #81d4fa", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          🧾 PDF
        </button>
      </div>
    </div>
    <div
      ref={pdfRef}
      style={{
        marginTop: "1rem",
        display: showPdfDiv ? "block" : "none"
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Filtered Questions</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f1f1" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Test</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Section</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Question</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Your Answer</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Correct Answer</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Reviewed</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{q.testName}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{q.section}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{q.question}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{q.userAnswer}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{q.correctAnswer}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{q.reviewed ? "Yes" : "No"}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{q.tags?.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
      {filtered.map(q => (
        <div key={q.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: q.reviewed ? "#f9f9f9" : "#fff4f4" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{q.question}</strong>
            <button onClick={() => toggleExpand(q.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {expanded[q.id] ? "▲" : "▼"}
            </button>
          </div>

          {/* Show choices if multiple choice */}
          {Array.isArray(q.choices) && q.choices.length > 0 && (
            <ul style={{ margin: "0.5rem 0 0.5rem 1rem", padding: 0 }}>
              {q.choices.map((choice, idx) => (
                <li key={idx} style={{ listStyle: "disc", marginBottom: "2px" }}>{choice}</li>
              ))}
            </ul>
          )}

          {expanded[q.id] && (
            <div style={{ marginTop: "0.5rem" }}>
              <p><strong>Your Answer:</strong> {q.userAnswer}</p>
              <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
            </div>
          )}

          <button onClick={() => toggleReviewed(q.id)} style={{ marginTop: "0.5rem" }}>
            {q.reviewed ? "✅ Reviewed" : "🔍 Unreviewed"}
          </button>

          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <p><strong>Tags:</strong> {q.tags?.join(", ") || "None"}</p>
            {editingTagId === q.id ? (
              <div>
                <input
                  type="text"
                  defaultValue={q.tags?.join(", ") || ""}
                  onBlur={(e) => handleTagEdit(q.id, e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <>
                <button onClick={() => setEditingTagId(q.id)} style={{ float: "right" }}>✏️ Edit Tags</button>
                <button onClick={() => handleDeleteQuestion(q.id)} style={{ color: "red", marginLeft: "0.5rem" }}>🗑️ Delete</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
    
  );
}


