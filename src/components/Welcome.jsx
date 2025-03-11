import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function Welcome() {
  const [showRegister, setShowRegister] = useState(true);

  return (
    <div className="welcome-container">
      {showRegister ? <Register /> : <Login />}
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
  );
}

export default Welcome;
