import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (!confirmPassword) newErrors.confirmPassword = "Powtórz hasło";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Hasła nie są identyczne";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        balance: 10000,
        portfolio: {},
      });
      navigate("/");
    } catch (error) {
      setErrors({ form: "Błąd rejestracji: " + error.message });
    }
  };

  return (
    <div className="auth-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleRegister}>
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
        <div className="form-group">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Powtórz hasło"
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </div>
        {errors.form && <span className="error">{errors.form}</span>}
        <button type="submit">Zarejestruj</button>
      </form>
    </div>
  );
}

export default Register;
