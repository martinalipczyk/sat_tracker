import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../Home.css";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [testName, setTestName] = useState("");
  const [sectionType, setSectionType] = useState("Full Test");
  const navigate = useNavigate();
  const startBtnRef = useRef(null);
  const modalRef = useRef(null);

  const handleStart = () => {
    if (!testName.trim()) return;
    localStorage.setItem("currentTest", JSON.stringify({ testName, sectionType }));
    setShowModal(false);
    navigate("/test");
  };

  useEffect(() => {
    if (showModal) {
      // focus first field on open
      modalRef.current?.querySelector("input")?.focus();
      const onKey = (e) => {
        if (e.key === "Escape") setShowModal(false);
        if (e.key === "Enter") handleStart();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    } else {
      // return focus to trigger button
      startBtnRef.current?.focus();
    }
  }, [showModal]);

  return (
    <div className="home">
      <div className="panel">
        <h1 className="title">SAT Tracker</h1>
        <p className="subtitle">Run a timed set. Log results. Improve deliberately.</p>
        <div className="actions">
          <button
            ref={startBtnRef}
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Start practice test
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal" ref={modalRef}>
            <div className="modal-header">
              <h2 className="modal-title">New practice session</h2>
              <button
                className="icon-btn"
                aria-label="Close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <label className="field">
                <span className="field-label">Test name</span>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Official Practice Test 6"
                  className="input"
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">Section</span>
                <select
                  value={sectionType}
                  onChange={(e) => setSectionType(e.target.value)}
                  className="select"
                >
                  <option value="Math">Math</option>
                  <option value="English">English</option>
                  <option value="Full Test">Full Test</option>
                </select>
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleStart} disabled={!testName.trim()}>
                Start
              </button>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
