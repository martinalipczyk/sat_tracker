import { useState, useRef, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnutChart({ math, english }) {
  const total = math + english;
  const mathPercent = total ? Math.round((math / total) * 100) : 0;

  const data = {
    labels: ['Math', 'English'],
    datasets: [
      {
        data: [math, english],
        backgroundColor: ['#ff69b4', '#6ec6ff'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
    },
    cutout: '70%',
  };

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 12, fontWeight: 600
      }}>
        {total === 0 ? 'No Data' : `${mathPercent}%`}
      </div>
    </div>
  );
}

export default function StudySession() {
  const [isRunning, setIsRunning] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualDetails, setManualDetails] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem("studySessions") || "[]"));
  const [details, setDetails] = useState("");
  const [subject, setSubject] = useState("");
  const [viewMode, setViewMode] = useState(null);
  const startTimeRef = useRef(null);
  const [mathTotal, setMathTotal] = useState(0);
  const [englishTotal, setEnglishTotal] = useState(0);

  useEffect(() => {
    let math = 0, english = 0;
    sessions.forEach(s => {
      if (s.subject === "Math") math += s.minutes;
      else if (s.subject === "English") english += s.minutes;
    });
    setMathTotal(math);
    setEnglishTotal(english);
  }, [sessions]);

  const start = () => {
    setIsEnded(false);
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsed;
      const id = setInterval(() => setElapsed(Date.now() - startTimeRef.current), 100);
      setIntervalId(id);
    }
  };

  const pause = () => {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(intervalId);
    }
  };

  const endSession = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIsRunning(false);
    }
    setIsEnded(true);
  };

  const reset = () => {
    setIsRunning(false);
    setIsEnded(false);
    clearInterval(intervalId);
    setElapsed(0);
    setDetails("");
    setSubject("");
  };

  const saveSession = () => {
    setIsEnded(true)
    console.log("save session called once" );
    const minutes = Math.round(elapsed / 60000);
    console.log("minutes:", minutes);
    if (minutes === 0 || !subject) {
      console.log("didnt work");
      return;
    }
    console.log("after return");
    const newSession = {
      id: Date.now(),
      minutes,
      details,
      subject,
      date: new Date().toLocaleString(),
      type: "stopwatch"
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
      details: manualDetails,
      subject: manualSubject,
      date: new Date().toLocaleString(),
      type: "manual"
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("studySessions", JSON.stringify(updated));

    setManualMinutes("");
    setManualDetails("");
    setManualSubject("");
    setViewMode(null);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const totalDisplay = totalMinutes < 60 ? `${totalMinutes} min` : `${(totalMinutes / 60).toFixed(1)} hr`;

  return (
    <div className="page" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem", background: "#fff4fa", border: "1px solid #f8bbd0", borderRadius: "14px", padding: "1.5rem 2rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 4 }}>Total Studied:</div>
          <div style={{ fontSize: "2rem", color: "#b71c5c", fontWeight: 700 }}>{totalDisplay}</div>
        </div>
        <DoughnutChart math={mathTotal} english={englishTotal} />
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <button className={`btn-primary${viewMode === "stopwatch" ? " active" : ""}`} onClick={() => setViewMode("stopwatch")} style={{ marginRight: 10 }}>Start Now!</button>
        <button className={`btn-primary${viewMode === "manual" ? " active" : ""}`} onClick={() => setViewMode("manual")}>Manual Entry</button>
      </div>

      {viewMode === "stopwatch" && (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
          <h3>Stopwatch</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "1rem 0" }}>
            {formatTime(elapsed)}
          </div>
          {!isEnded ? (
            <>
              <div style={{ marginBottom: "1rem" }}>
                {!isRunning && <button className="btn-primary" onClick={start} style={{ marginRight: 8 }}>Start</button>}
                {isRunning && <button className="btn-primary" onClick={pause} style={{ marginRight: 8 }}>Pause</button>}
                {(isRunning || elapsed > 0) && <button className="btn-primary" onClick={endSession} style={{ marginRight: 8 }}>End</button>}
                <button className="btn-primary" onClick={reset}>Reset</button>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="text"
                  placeholder="What did you study?"
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  style={{ width: "100%", borderRadius: 6, padding: "0.5rem", marginBottom: "0.5rem" }}
                />
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={{ width: "100%", borderRadius: 6, padding: "0.5rem" }}
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Math">Math</option>
                  <option value="English">English</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: "#b71c5c", fontWeight: 600 }}>Session Ended. Final Time: {formatTime(elapsed)}</p>
              <button className="btn-primary" onClick={saveSession} disabled={elapsed === 0 || !subject}>Save Session</button>
            </>
          )}
        </div>
      )}

      {viewMode === "manual" && (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
          <h3>Manual Entry</h3>
          <form onSubmit={submitManual}>
            <div style={{ marginBottom: "1rem" }}>
              <input type="number" min="1" placeholder="Minutes studied" value={manualMinutes} onChange={e => setManualMinutes(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <input type="text" placeholder="What did you study?" value={manualDetails} onChange={e => setManualDetails(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }} />
              <select value={manualSubject} onChange={e => setManualSubject(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }}>
                <option value="">Select Subject</option>
                <option value="Math">Math</option>
                <option value="English">English</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">Add Session</button>
          </form>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", padding: "2rem" }}>
        <h3>Session Log</h3>
        {sessions.length === 0 && <p>No sessions logged yet.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {sessions.map(s => (
            <li key={s.id} style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0" }}>
              <strong>{s.minutes} min</strong> – {s.details || <em>No details</em>}<br />
              <span style={{ color: s.subject === "Math" ? "#ff69b4" : "#6ec6ff", fontWeight: 600 }}>{s.subject}</span><br />
              <span style={{ fontSize: "0.9em", color: "#888" }}>{s.date} ({s.type})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
