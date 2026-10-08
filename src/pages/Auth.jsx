import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../services/firebase";

function GoogleLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.2 11.4-8.2Z"
      />
    </svg>
  );
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === "/register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getErrorMessage(code) {
    const messages = {
      "auth/email-already-in-use": "Este e-mail já possui uma conta.",
      "auth/invalid-email": "Digite um e-mail válido.",
      "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/popup-closed-by-user": "A janela do Google foi fechada.",
      "auth/popup-blocked": "O navegador bloqueou a janela de login.",
      "auth/operation-not-allowed":
        "Este método de login ainda não está ativado no Firebase.",
    };

    return messages[code] || "Não foi possível concluir. Tente novamente.";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="logo auth-logo">
        Football<span>Stats</span>
      </Link>

      <main className="auth-card">
        <Link to="/" className="back-button">
          Voltar
        </Link>

        <div className="auth-heading">
          <span className="section-label">FOOTBALLSTATS</span>
          <h1>{isRegister ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
          <p>
            {isRegister
              ? "Comece a organizar suas estatísticas de futebol."
              : "Entre para acessar seus jogadores e suas temporadas."}
          </p>
        </div>

        <button
          className="google-button"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleLogo />
          Continuar com Google
        </button>

        <div className="auth-divider">
          <span>ou continue com e-mail</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="voce@email.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group auth-password">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="button auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Aguarde..."
              : isRegister
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Entrar" : "Criar conta"}
          </Link>
        </p>
      </main>
    </div>
  );
}