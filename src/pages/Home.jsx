import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [testName, setTestName] = useState("");
  const [sectionType, setSectionType] = useState("Full Test");
  const navigate = useNavigate();

  const handleStart = () => {
    // Save test setup to localStorage
    localStorage.setItem("currentTest", JSON.stringify({ testName, sectionType }));    setShowModal(false);
    navigate("/test");
  };

  return (
    <div
      className="page"
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "3rem 2.5rem",
          minWidth: "350px",
          maxWidth: "90vw",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "2.2rem", marginBottom: "1.5rem" }}>
          Welcome to the SAT Tracker!
        </h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Start Practice Test
        </button>
      </div>
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "2rem", borderRadius: "10px", width: "300px"
          }}>
            <h3>Start Practice Test</h3>
            <label>
              Test Name:
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                required
              />
            </label>
            <label>
              Section:
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
              >
                <option value="Math">Math</option>
                <option value="English">English</option>
                <option value="Full Test">Full Test</option>
              </select>
            </label>
            <div style={{ marginTop: "1rem" }}>
              <button className="btn-primary" onClick={handleStart}>Start</button>
              <button onClick={() => setShowModal(false)} style={{ marginLeft: "1rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
