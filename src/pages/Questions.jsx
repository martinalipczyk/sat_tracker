// Questions.jsx
import React, { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

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
  const [showAddBox, setShowAddBox] = useState(false);
  const [showPdfDiv, setShowPdfDiv] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    userAnswer: "",
    correctAnswer: "",
    section: "",
    tags: "",
    choices: "",
  });

  const pdfRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wrongQuestions") || "[]");
    setQuestions(stored);
    const tags = new Set();
    stored.forEach((q) => q.tags?.forEach((t) => tags.add(t)));
    setAvailableTags([...tags]);
  }, []);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleReviewed = (id) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, reviewed: !q.reviewed } : q
    );
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
  };

  const handleTagEdit = (id, newTags) => {
    const updated = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            tags: newTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          }
        : q
    );
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
    setEditingTagId(null);
  };

  const handleDeleteQuestion = (id) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
  };

  const filtered = questions.filter((q) => {
    const matchesReview = onlyUnreviewed ? !q.reviewed : true;
    const matchesTag = selectedTag ? q.tags?.includes(selectedTag) : true;
    const matchesTest = selectedTest ? q.testName === selectedTest : true;
    const matchesSection = selectedSection ? q.section === selectedSection : true;
    return matchesReview && matchesTag && matchesTest && matchesSection;
  });

  const allTests = [...new Set(questions.map((q) => q.testName))];
  const allSections = [...new Set(questions.map((q) => q.section))];

  const exportToCSV = () => {
    const headers = [
      "Test Name",
      "Section",
      "Question",
      "User Answer",
      "Correct Answer",
      "Reviewed",
      "Tags",
    ];
    const rows = filtered.map((q) => [
      q.testName,
      q.section,
      q.question,
      q.userAnswer,
      q.correctAnswer,
      q.reviewed ? "Yes" : "No",
      q.tags?.join(";") || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((e) => e.map((x) => `"${x}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "filtered_questions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    setShowPdfDiv(true);
    await new Promise((r) => setTimeout(r, 100));
    if (pdfRef.current) {
      await html2pdf()
        .from(pdfRef.current)
        .set({
          margin: 0.5,
          filename: "filtered_questions.pdf",
          html2canvas: { scale: 2 },
        })
        .save();
    }
    setShowPdfDiv(false);
  };

  // Stats for chart
  const totalCount = filtered.length;
  const reviewedCount = filtered.filter((q) => q.reviewed).length;
  const unreviewedCount = totalCount - reviewedCount;

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      ctx.restore();
      const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0) || 1;
      const reviewed = chart.data.datasets[0].data[0] || 0;
      const percentage = Math.round((reviewed / total) * 100);
      const fontSize = (height / 140).toFixed(2);
      ctx.font = `${fontSize}em system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "var(--text)";
      const text = `${percentage}%`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;
      ctx.fillText(text, textX, textY);
      ctx.save();
    },
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.question.trim()) return;
    const questionObj = {
      id: Date.now(),
      question: newQuestion.question,
      userAnswer: newQuestion.userAnswer,
      correctAnswer: newQuestion.correctAnswer,
      section: newQuestion.section,
      testName: "", // manual adds not tied to test
      reviewed: false,
      tags: newQuestion.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      choices: newQuestion.choices
        ? newQuestion.choices
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
        : [],
    };
    const updated = [questionObj, ...questions];
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
    setNewQuestion({
      question: "",
      userAnswer: "",
      correctAnswer: "",
      section: "",
      tags: "",
      choices: "",
    });
    setShowAddBox(false);
  };

  return (
    <div className="page questions-page">
      <header className="q-header">
        <h2 className="q-title">Review Questions</h2>
        <div className="q-toolbar">
          <button className="btn-primary" onClick={() => setShowAddBox((v) => !v)}>
            {showAddBox ? "Close" : "Add Question"}
          </button>
          <div className="q-export">
            <button className="btn-secondary" onClick={exportToCSV}>Export CSV</button>
            <button className="btn-secondary" onClick={exportToPDF}>Export PDF</button>
          </div>
        </div>
      </header>

      {showAddBox && (
        <form className="card q-add" onSubmit={handleAddQuestion}>
          <h3 className="q-section-title">Add a new question</h3>
          <div className="q-grid">
            <label className="field">
              <span className="field-label">Question</span>
              <textarea
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion((q) => ({ ...q, question: e.target.value }))
                }
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Your answer</span>
              <input
                type="text"
                value={newQuestion.userAnswer}
                onChange={(e) =>
                  setNewQuestion((q) => ({ ...q, userAnswer: e.target.value }))
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Correct answer</span>
              <input
                type="text"
                value={newQuestion.correctAnswer}
                onChange={(e) =>
                  setNewQuestion((q) => ({ ...q, correctAnswer: e.target.value }))
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Section</span>
              <input
                type="text"
                placeholder="e.g., Math, English"
                value={newQuestion.section}
                onChange={(e) =>
                  setNewQuestion((q) => ({ ...q, section: e.target.value }))
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Tags</span>
              <input
                type="text"
                placeholder="comma separated (algebra, geometry)"
                value={newQuestion.tags}
                onChange={(e) =>
                  setNewQuestion((q) => ({ ...q, tags: e.target.value }))
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Choices (optional)</span>
              <input
                type="text"
                placeholder="A | B | C | D"
                value={newQuestion.choices}
                onChange={(e) =>
                  setNewQuestion((q) => ({ ...q, choices: e.target.value }))
                }
              />
            </label>
          </div>

          <div className="q-actions">
            <button className="btn-primary" type="submit">Add</button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setShowAddBox(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="q-top">
        <div className="card q-filters">
          <h3 className="q-section-title">Filters</h3>
          <div className="q-grid">
            <label className="field">
              <span className="field-label">Test</span>
              <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}>
                <option value="">All</option>
                {allTests.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Section</span>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                <option value="">All</option>
                {allSections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Tag</span>
              <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
                <option value="">All</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </label>

            <label className="field q-checkbox">
              <input
                type="checkbox"
                checked={onlyUnreviewed}
                onChange={() => setOnlyUnreviewed((p) => !p)}
              />
              <span>Show only unreviewed</span>
            </label>
          </div>
        </div>

        <div className="card q-stats">
          <h3 className="q-section-title">Stats</h3>
          <div className="q-kpis">
            <div className="kpi">
              <div className="kpi-label">Total</div>
              <div className="kpi-value">{totalCount}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Reviewed</div>
              <div className="kpi-value">{reviewedCount}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Unreviewed</div>
              <div className="kpi-value">{unreviewedCount}</div>
            </div>
          </div>

          <div className="q-chart">
            <Doughnut
              data={{
                labels: ["Reviewed", "Unreviewed"],
                datasets: [
                  {
                    data: [reviewedCount, unreviewedCount],
                    backgroundColor: ["#22c55e", "#ef4444"], /* green & red */
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false }, centerText: true },
                cutout: "60%",
              }}
              plugins={[centerTextPlugin]}
            />
          </div>
        </div>

        <div className="q-export card q-export-card">
          <h3 className="q-section-title">Export</h3>
          <div className="q-export-actions">
            <button className="btn-secondary" onClick={exportToCSV}>CSV</button>
            <button className="btn-secondary" onClick={exportToPDF}>PDF</button>
          </div>
        </div>
      </section>

      {/* Hidden print container for PDF */}
      <div ref={pdfRef} className={`q-print ${showPdfDiv ? "show" : ""}`}>
        <h3>Filtered Questions</h3>
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Section</th>
              <th>Question</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
              <th>Reviewed</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr key={i}>
                <td>{q.testName}</td>
                <td>{q.section}</td>
                <td>{q.question}</td>
                <td>{q.userAnswer}</td>
                <td>{q.correctAnswer}</td>
                <td>{q.reviewed ? "Yes" : "No"}</td>
                <td>{q.tags?.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Questions list */}
      <div className="q-list">
        {filtered.map((q) => (
          <article
            key={q.id}
            className={`q-item card ${q.reviewed ? "is-reviewed" : ""}`}
          >
            <header className="q-item-head">
              <strong className="q-item-question">{q.question}</strong>
              <div className="q-item-head-actions">
                <span className={`chip ${q.reviewed ? "chip-success" : "chip-danger"}`}>
                  {q.reviewed ? "Reviewed" : "Unreviewed"}
                </span>
                <button
                  className="icon-toggle"
                  onClick={() => toggleExpand(q.id)}
                  aria-expanded={!!expanded[q.id]}
                >
                  {expanded[q.id] ? "▲" : "▼"}
                </button>
              </div>
            </header>

            {Array.isArray(q.choices) && q.choices.length > 0 && (
              <ul className="q-choices">
                {q.choices.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            )}

            {expanded[q.id] && (
              <div className="q-detail">
                <p><span className="muted">Your answer:</span> {q.userAnswer || "—"}</p>
                <p><span className="muted">Correct answer:</span> {q.correctAnswer || "—"}</p>
              </div>
            )}

            <div className="q-item-actions">
              <button className="btn-secondary" onClick={() => toggleReviewed(q.id)}>
                {q.reviewed ? "Mark unreviewed" : "Mark reviewed"}
              </button>

              <div className="q-tags">
                <span className="muted">Tags:</span>{" "}
                {q.tags?.length ? q.tags.join(", ") : "None"}
                {editingTagId === q.id ? (
                  <input
                    className="q-tag-editor"
                    type="text"
                    defaultValue={q.tags?.join(", ") || ""}
                    onBlur={(e) => handleTagEdit(q.id, e.target.value)}
                    autoFocus
                  />
                ) : (
                  <>
                    <button
                      className="btn-secondary"
                      onClick={() => setEditingTagId(q.id)}
                    >
                      Edit tags
                    </button>
                    <button
                      className="btn-secondary danger"
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
