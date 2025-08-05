import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = {
  Math: ["Math Section 1", "Math Section 2"],
  English: ["English Section 1", "English Section 2"],
  "Full Test": [
    "Math Section 1",
    "Math Section 2",
    "Break",
    "English Section 1",
    "English Section 2"
  ]
};

const DURATIONS = {
  "Math Section 1": 35 * 60,
  "Math Section 2": 35 * 60,
  "English Section 1": 32 * 60,
  "English Section 2": 32 * 60,
  "Break": 10 * 60
};

export default function Test() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("currentTest"));
    if (!data || !data.sectionType) {
      navigate("/");
      return;
    }
    const sectionList = SECTIONS[data.sectionType];
    setSteps(sectionList);
    setTimeLeft(DURATIONS[sectionList[0]]);
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    setIntervalId(id);

    return () => clearInterval(id);
  }, [timeLeft]);

  const skipTimer = () => {
    clearInterval(intervalId);
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentIndex(nextIndex);
      setTimeLeft(DURATIONS[steps[nextIndex]]);
    } else {
      navigate("/test/results");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="page">
      {steps.length > 0 && currentIndex < steps.length && (
        <>
          <h2>{steps[currentIndex]}</h2>
          <h3 style={{ fontSize: "3rem", margin: "1rem 0" }}>
            {formatTime(timeLeft)}
          </h3>
          <button className="btn-primary" onClick={skipTimer}>
            Skip This Timer
          </button>
        </>
      )}
    </div>
  );
}
