import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email jest wymagany";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Nieprawidłowy email";
    if (!password) newErrors.password = "Hasło jest wymagane";
    else if (password.length < 6)
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setErrors({ form: "Nieprawidłowy email lub hasło" });
    }
  };

  return (
    <div className="auth-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        {errors.form && <span className="error">{errors.form}</span>}
        <button type="submit">Zaloguj</button>
      </form>
    </div>
  );
}

export default Login;
