import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Settings,
  LogOut,
  UserRound,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { auth, db } from "../services/firebase";

export function Home() {
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(() => {
    return localStorage.getItem("footballStatsConfirmLogout") !== "false";
  });

  const navigate = useNavigate();

  async function loadPlayers(userId) {
    try {
      const playersQuery = query(
        collection(db, "players"),
        where("ownerId", "==", userId)
      );

      const querySnapshot = await getDocs(playersQuery);

      const playersList = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setPlayers(playersList);
    } catch (error) {
      console.error("Erro ao carregar jogadores:", error);
      setPlayers([]);
    }
  }

  async function loadCoaches(userId) {
    try {
      const coachesQuery = query(
        collection(db, "coaches"),
        where("ownerId", "==", userId)
      );

      const querySnapshot = await getDocs(coachesQuery);

      const coachesList = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setCoaches(coachesList);
    } catch (error) {
      console.error("Erro ao carregar treinadores:", error);
      setCoaches([]);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUserEmail(user?.email || "");

      if (!user) {
        setPlayers([]);
        setCoaches([]);
        return;
      }

      await Promise.all([
        loadPlayers(user.uid),
        loadCoaches(user.uid),
      ]);
    });

    return () => unsubscribe();
  }, []);

  function toggleConfirmLogout(checked) {
    setConfirmLogout(checked);
    localStorage.setItem("footballStatsConfirmLogout", String(checked));
  }

  async function handleLogout() {
    if (
      confirmLogout &&
      !window.confirm("Tem certeza que deseja sair da sua conta?")
    ) {
      return;
    }

    try {
      await signOut(auth);
      setMenuOpen(false);
      setPreferencesOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
      window.alert("Não foi possível sair da conta. Tente novamente.");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="home-header-left">
          <Link to="/" className="home-back-link">
            Voltar
          </Link>

          <Link to="/" className="logo home-logo-link">
            Football<span>Stats</span>
          </Link>
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 14px",
              border: "1px solid var(--border-color, #303642)",
              borderRadius: "10px",
              background: "var(--card-bg, #171b24)",
              color: "var(--text-color, #ffffff)",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            <span></span>
            <ChevronDown size={15} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "min(290px, calc(100vw - 32px))",
                padding: "10px",
                border: "1px solid var(--border-color, #303642)",
                borderRadius: "14px",
                background: "var(--card-bg, #171b24)",
                color: "var(--text-color, #ffffff)",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.3)",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 10px",
                  borderBottom: "1px solid var(--border-color, #303642)",
                  marginBottom: "6px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--primary-color, #22c55e)",
                    color: "#ffffff",
                  }}
                >
                  <UserRound size={21} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: "14px" }}>
                    Minha conta
                  </strong>
                  <span
                    title={userEmail}
                    style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "12px",
                      opacity: 0.7,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {userEmail || "Usuário conectado"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setPreferencesOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "12px 10px",
                  border: "none",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <Settings size={18} />
                <span>Preferências</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "12px 10px",
                  border: "none",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#ef4444",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <LogOut size={18} />
                <span>Sair da conta</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="career-section">
          <div className="section-header">
            <h2 className="section-title">Carreira de Jogadores</h2>

            <Link to="/new-player" className="button">
              + Novo Jogador
            </Link>
          </div>

          {players.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum jogador cadastrado</h3>
              <p>Comece criando o primeiro jogador da sua carreira.</p>

              <Link to="/new-player" className="button">
                Cadastrar Jogador
              </Link>
            </div>
          ) : (
            <div className="players-grid">
              {players.map((player) => (
                <Link
                  to={`/player/${player.id}`}
                  key={player.id}
                  className="player-card"
                >
                  <div className="player-avatar">
                    {player.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="player-name">{player.name}</h3>
                    <p className="player-info">{player.nationality}</p>
                    <div className="player-position">{player.position}</div>
                  </div>

                  <div className="player-arrow"></div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="career-section">
          <div className="section-header">
            <h2 className="section-title">Carreira de Treinadores</h2>

            <Link to="/create-coach" className="button">
              + Novo Treinador
            </Link>
          </div>

          {coaches.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum treinador cadastrado</h3>
              <p>
                Comece criando um treinador para acompanhar sua trajetória
                em clubes e seleções.
              </p>

              <Link to="/create-coach" className="button">
                Cadastrar Treinador
              </Link>
            </div>
          ) : (
            <div className="players-grid">
              {coaches.map((coach) => (
                <Link
                  to={`/coach/${coach.id}`}
                  key={coach.id}
                  className="player-card"
                >
                  <div className="player-avatar">
                    {coach.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="player-name">{coach.name}</h3>
                    <p className="player-info">{coach.nationality}</p>
                    <div className="player-position">Treinador</div>
                  </div>

                  <div className="player-arrow"></div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {preferencesOpen && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPreferencesOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0, 0, 0, 0.65)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="preferences-title"
            style={{
              width: "100%",
              maxWidth: "430px",
              padding: "24px",
              border: "1px solid var(--border-color, #303642)",
              borderRadius: "16px",
              background: "var(--card-bg, #171b24)",
              color: "var(--text-color, #ffffff)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Settings size={22} />
                <h2
                  id="preferences-title"
                  style={{ margin: 0, fontSize: "20px" }}
                >
                  Preferências
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPreferencesOpen(false)}
                aria-label="Fechar preferências"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "7px",
                  border: "none",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "24px" }}>
              Personalize algumas opções da sua experiência no FootballStats.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "16px 0",
                borderTop: "1px solid var(--border-color, #303642)",
                borderBottom: "1px solid var(--border-color, #303642)",
              }}
            >
              <ShieldCheck size={21} style={{ flexShrink: 0, marginTop: "2px" }} />

              <div style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: "14px" }}>
                  Confirmar antes de sair
                </strong>
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "13px",
                    opacity: 0.7,
                    lineHeight: 1.5,
                  }}
                >
                  Pergunta se você realmente deseja encerrar sua sessão.
                </p>
              </div>

              <input
                type="checkbox"
                checked={confirmLogout}
                onChange={(event) => toggleConfirmLogout(event.target.checked)}
                aria-label="Confirmar antes de sair"
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#22c55e",
                  cursor: "pointer",
                }}
              />
            </div>

            <p style={{ fontSize: "12px", opacity: 0.55, marginTop: "16px" }}>
              Sua preferência fica salva neste navegador.
            </p>

            <button
              type="button"
              className="button"
              onClick={() => setPreferencesOpen(false)}
              style={{ width: "100%", marginTop: "12px" }}
            >
              Concluído
            </button>
          </section>
        </div>
      )}
    </div>
  );
}