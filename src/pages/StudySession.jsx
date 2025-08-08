import { useEffect, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnutChart({ math, english }) {
  const total = (math || 0) + (english || 0);
  const mathPercent = total ? Math.round((math / total) * 100) : 0;

  const data = {
    labels: ["Math", "English"],
    datasets: [
      {
        data: [math, english],
        backgroundColor: ["#1f6feb", "#64748b"], // brand blue + slate
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    cutout: "70%",
    animation: { duration: 180 },
  };

  return (
    <div className="donut-wrap" aria-label="Study time distribution">
      <Doughnut data={data} options={options} />
      <div className="donut-center">
        {total === 0 ? "—" : `${mathPercent}%`}
      </div>
    </div>
  );
}

export default function StudySession() {
  const [isRunning, setIsRunning] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const [manualMinutes, setManualMinutes] = useState("");
  const [manualDetails, setManualDetails] = useState("");
  const [manualSubject, setManualSubject] = useState("");

  const [sessions, setSessions] = useState(() =>
    JSON.parse(localStorage.getItem("studySessions") || "[]")
  );

  const [details, setDetails] = useState("");
  const [subject, setSubject] = useState("");
  const [viewMode, setViewMode] = useState(null);

  const [mathTotal, setMathTotal] = useState(0);
  const [englishTotal, setEnglishTotal] = useState(0);

  // Aggregate math/english totals
  useEffect(() => {
    let math = 0,
      english = 0;
    sessions.forEach((s) => {
      if (s.subject === "Math") math += s.minutes;
      if (s.subject === "English") english += s.minutes;
    });
    setMathTotal(math);
    setEnglishTotal(english);
  }, [sessions]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = () => {
    setIsEnded(false);
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 100);
  };

  const pause = () => {
    if (!isRunning) return;
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const endSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsEnded(true);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsEnded(false);
    setElapsed(0);
    setDetails("");
    setSubject("");
  };

  const saveSession = () => {
    const minutes = Math.max(1, Math.round(elapsed / 60000)); // floor to at least 1 min
    if (!subject) return;
    const newSession = {
      id: Date.now(),
      minutes,
      details: details.trim(),
      subject,
      date: new Date().toLocaleString(),
      type: "stopwatch",
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("studySessions", JSON.stringify(updated));
    reset();
    setViewMode(null);
  };

  const submitManual = (e) => {
    e.preventDefault();
    const minutes = parseInt(manualMinutes, 10);
    if (!minutes || minutes <= 0 || !manualSubject) return;
    const newSession = {
      id: Date.now(),
      minutes,
      details: manualDetails.trim(),
      subject: manualSubject,
      date: new Date().toLocaleString(),
      type: "manual",
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("studySessions", JSON.stringify(updated));
    setManualMinutes("");
    setManualDetails("");
    setManualSubject("");
    setViewMode(null);
  };

  const deleteSession = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("studySessions", JSON.stringify(updated));
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const totalDisplay =
    totalMinutes < 60 ? `${totalMinutes} min` : `${(totalMinutes / 60).toFixed(1)} hr`;

  return (
    <div className="page study-page">
      {/* Top summary */}
      <section className="card study-summary">
        <div className="study-kpi">
          <div className="kpi-label">Total studied</div>
          <div className="kpi-value">{totalDisplay}</div>
        </div>
        <DoughnutChart math={mathTotal} english={englishTotal} />
      </section>

      {/* Mode Switch */}
      <div className="study-switch">
        <button
          className={`btn-primary ${viewMode === "stopwatch" ? "active" : ""}`}
          onClick={() => setViewMode("stopwatch")}
        >
          Start now
        </button>
        <button
          className={`btn-secondary ${viewMode === "manual" ? "active" : ""}`}
          onClick={() => setViewMode("manual")}
        >
          Manual entry
        </button>
      </div>

      {/* Stopwatch */}
      {viewMode === "stopwatch" && (
        <section className="card stopwatch">
          <h3 className="section-title">Stopwatch</h3>
          <div className="timer">{formatTime(elapsed)}</div>

          {!isEnded ? (
            <>
              <div className="controls">
                {!isRunning && (
                  <button className="btn-primary" onClick={start}>
                    Start
                  </button>
                )}
                {isRunning && (
                  <button className="btn-primary" onClick={pause}>
                    Pause
                  </button>
                )}
                {(isRunning || elapsed > 0) && (
                  <button className="btn-secondary" onClick={endSession}>
                    End
                  </button>
                )}
                <button className="btn-secondary" onClick={reset}>
                  Reset
                </button>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span className="field-label">What did you study?</span>
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g., Algebra: systems of equations"
                  />
                </label>

                <label className="field">
                  <span className="field-label">Subject</span>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >
                    <option value="">Select subject</option>
                    <option value="Math">Math</option>
                    <option value="English">English</option>
                  </select>
                </label>
              </div>
            </>
          ) : (
            <div className="ended">
              <p className="ended-note">
                Session ended. Final time: <strong>{formatTime(elapsed)}</strong>
              </p>
              <button
                className="btn-primary"
                onClick={saveSession}
                disabled={elapsed === 0 || !subject}
                title={!subject ? "Select a subject before saving" : "Save session"}
              >
                Save session
              </button>
              <button className="btn-secondary" onClick={reset}>
                Discard
              </button>
            </div>
          )}
        </section>
      )}

      {/* Manual */}
      {viewMode === "manual" && (
        <section className="card manual">
          <h3 className="section-title">Manual entry</h3>
          <form onSubmit={submitManual} className="form-grid">
            <label className="field">
              <span className="field-label">Minutes studied</span>
              <input
                type="number"
                min="1"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Subject</span>
              <select
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
                required
              >
                <option value="">Select subject</option>
                <option value="Math">Math</option>
                <option value="English">English</option>
              </select>
            </label>

            <label className="field full">
              <span className="field-label">What did you study?</span>
              <input
                type="text"
                value={manualDetails}
                onChange={(e) => setManualDetails(e.target.value)}
                placeholder="e.g., Reading comprehension set #3"
              />
            </label>

            <div className="form-actions">
              <button className="btn-primary" type="submit">
                Add session
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setViewMode(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Session Log */}
      <section className="card session-log">
        <h3 className="section-title">Session log</h3>
        {sessions.length === 0 ? (
          <p className="muted">No sessions logged yet.</p>
        ) : (
          <ul className="log-list">
            {sessions.map((s) => (
              <li key={s.id} className="log-item">
                <div className="log-main">
                  <span className="log-min">{s.minutes} min</span>
                  <span className={`log-subject ${s.subject === "Math" ? "math" : "english"}`}>
                    {s.subject}
                  </span>
                  <span className="log-details">{s.details || "No details"}</span>
                </div>
                <div className="log-meta">
                  <span className="muted">{s.date} · {s.type}</span>
                  <button
                    className="icon-btn danger"
                    aria-label="Delete session"
                    onClick={() => deleteSession(s.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
