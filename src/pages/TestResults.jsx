// ✅ Updated TestResults.jsx with tag input and styling
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TestResults() {
  const navigate = useNavigate();
  const [section, setSection] = useState("");
  const [testName, setTestName] = useState("");
  const [score, setScore] = useState("");
  const [mathScore, setMathScore] = useState("");
  const [englishScore, setEnglishScore] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [showWrongForm, setShowWrongForm] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);

  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", "", ""]);
  const [isMultipleChoice, setIsMultipleChoice] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionSection, setQuestionSection] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("currentTest"));
    if (data && data.testName && data.sectionType) {
      setTestName(data.testName);
      setSection(data.sectionType);
    } else {
      const manualName = prompt("Enter test name:");
      const manualSection = prompt("Enter test type (Math, English, or Full Test):");
      setTestName(manualName || "Unnamed Test");
      setSection(manualSection || "Full Test");
    }
  }, []);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: crypto.randomUUID(),
      testName,
      question,
      section: questionSection,
      choices: isMultipleChoice ? choices.filter((c) => c.trim()) : null,
      userAnswer,
      correctAnswer,
      type: isMultipleChoice ? "multiple" : "written",
      reviewed: false,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
    };
    setWrongQuestions((prev) => [...prev, newQuestion]);

    setQuestion("");
    setChoices(["", "", "", "", ""]);
    setUserAnswer("");
    setCorrectAnswer("");
    setIsMultipleChoice(true);
    setQuestionSection("");
    setTagsInput("");
  };

  const handleSubmit = () => {
    const testEntry = {
      id: crypto.randomUUID(),
      testName,
      date: new Date().toISOString().split("T")[0],
      section,
      score: section === "Full Test" ? parseInt(mathScore) + parseInt(englishScore) : score,
      mathScore: section === "Full Test" ? mathScore : undefined,
      englishScore: section === "Full Test" ? englishScore : undefined
    };

    const prevScores = JSON.parse(localStorage.getItem("scores") || "[]");
    localStorage.setItem("scores", JSON.stringify([...prevScores, testEntry]));

    const prevQuestions = JSON.parse(localStorage.getItem("wrongQuestions") || "[]");
    localStorage.setItem("wrongQuestions", JSON.stringify([...prevQuestions, ...wrongQuestions]));

    setSubmitted(true);
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="page">
      <h2>Submit Results for {testName}</h2>

      {section === "Full Test" ? (
        <div style={{ display: "flex", gap: "1rem" }}>
          <label>Math Score: <input type="number" value={mathScore} onChange={(e) => setMathScore(e.target.value)} /></label>
          <label>English Score: <input type="number" value={englishScore} onChange={(e) => setEnglishScore(e.target.value)} /></label>
          <span>Total: {mathScore && englishScore ? parseInt(mathScore) + parseInt(englishScore) : "-"}</span>
        </div>
      ) : (
        <label>Score: <input type="number" value={score} onChange={(e) => setScore(e.target.value)} /></label>
      )}

      <button onClick={() => setShowWrongForm(!showWrongForm)} style={{ marginTop: "1rem" }}>
        {showWrongForm ? "Hide Wrong Question Form" : "Add Wrong Question"}
      </button>

      {showWrongForm && (
        <div style={{ marginTop: "1rem" }}>
          <label>Section:
            <select value={questionSection} onChange={(e) => setQuestionSection(e.target.value)}>
              <option value="">Select Section</option>
              <option value="Math">Math</option>
              <option value="English">English</option>
            </select>
          </label>

          {questionSection && (
            <>
              <label>Question:
                <input value={question} onChange={(e) => setQuestion(e.target.value)} />
              </label>

              {questionSection === "Math" && (
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label><input type="radio" checked={isMultipleChoice} onChange={() => setIsMultipleChoice(true)} /> Multiple Choice</label>
                  <label><input type="radio" checked={!isMultipleChoice} onChange={() => setIsMultipleChoice(false)} /> Fill in the Blank</label>
                </div>
              )}

              {isMultipleChoice && choices.map((choice, i) => (
                <label key={i}>Choice {i + 1}: <input value={choice} onChange={(e) => {
                  const updated = [...choices];
                  updated[i] = e.target.value;
                  setChoices(updated);
                }} /></label>
              ))}

              {isMultipleChoice ? (
                <>
                  <label>Your Answer:
                    <select value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}>
                      <option value="">Select...</option>
                      {choices.map((c, i) => <option key={i} value={c}>{c || `Choice ${i + 1}`}</option>)}
                    </select>
                  </label>
                  <label>Correct Answer:
                    <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}>
                      <option value="">Select...</option>
                      {choices.map((c, i) => <option key={i} value={c}>{c || `Choice ${i + 1}`}</option>)}
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label>Your Answer: <input value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} /></label>
                  <label>Correct Answer: <input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} /></label>
                </>
              )}

              <label>Tags (comma-separated):
                <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g. exponents, comma rules" />
              </label>

              <button onClick={handleAddQuestion} style={{ marginTop: "0.5rem" }}>Add Question</button>
            </>
          )}
        </div>
      )}

      {wrongQuestions.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Added Questions</h3>
          <ul>
            {wrongQuestions.map((q) => (
              <li key={q.id}>
                <strong>{q.section}</strong>: {q.question}
                {q.tags && q.tags.length > 0 && (
                  <div style={{ marginTop: "0.25rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                    {q.tags.map((tag, i) => (
                      <span key={i} style={{ backgroundColor: "#d0ebff", color: "#003566", borderRadius: "12px", padding: "2px 8px", fontSize: "0.8rem" }}>{tag}</span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleSubmit} style={{ marginTop: "1rem" }}>Submit</button>
      {submitted && <p>Submitted! Redirecting…</p>}
    </div>
  );
}
