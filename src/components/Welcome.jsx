import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../store/themeSlice";
import { FaSun, FaMoon } from "react-icons/fa";
import Login from "./Login";
import Register from "./Register";
import "../styles/Welcome.css";

function Welcome() {
  const [showRegister, setShowRegister] = useState(true);
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.theme);

  return (
    <div className="welcome-container">
      <p>
        <button
          onClick={() => dispatch(toggleTheme())}
          className="theme-toggle"
          title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </p>
      {showRegister ? <Register /> : <Login />}
      <div className="switch-container">
        <p className="switch-text">
          {showRegister ? "Masz już konto?" : "Nie masz konta?"}
          <button
            onClick={() => setShowRegister(!showRegister)}
            className="switch-button"
          >
            {showRegister ? "Zaloguj się" : "Zarejestruj się"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Welcome;
