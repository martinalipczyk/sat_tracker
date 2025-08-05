import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <h1 className="header-title">SAT Tracker</h1>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/scores">Scores</Link>
        <Link to="/questions">Questions</Link>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
}
