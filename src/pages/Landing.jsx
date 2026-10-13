import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  UserRound,
  ChartNoAxesColumnIncreasing,
  CalendarDays,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trophy,
  Target,
  ChartLine,
  Menu,
  X,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

const slides = [
  {
    eyebrow: "SUA CARREIRA, EM NÚMEROS",
    title: "Acompanhe cada jogo. Registre cada conquista.",
    description:
      "Organize sua carreira, acompanhe estatísticas e veja sua evolução dentro do futebol.",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2000&q=85",
    position: "center 48%",
  },
  {
    eyebrow: "CADA GOL CONTA",
    title: "Transforme seu desempenho em história.",
    description:
      "Registre jogos, gols e assistências e acompanhe seus números ao longo das temporadas.",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2000&q=85",
    position: "center 50%",
  },
  {
    eyebrow: "SUA HISTÓRIA NÃO PARA",
    title: "Organize sua carreira. Supere seus limites.",
    description:
      "Cadastre jogadores, clubes e temporadas e mantenha toda a sua trajetória organizada em um só lugar.",
    image:
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=2000&q=85",
    position: "center 50%",
  },
];

const features = [
  {
    icon: UserRound,
    title: "Perfil completo",
    description:
      "Cadastre informações, posições, nacionalidade e muito mais.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Estatísticas da carreira",
    description:
      "Registre jogos, gols, assistências e acompanhe sua evolução.",
  },
  {
    icon: CalendarDays,
    title: "Múltiplas temporadas",
    description: "Organize suas temporadas em clubes e seleções.",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados seguros",
    description: "Tenha seus dados organizados e associados à sua conta.",
  },
];

export default function Landing() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [user, setUser] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(
    () => localStorage.getItem("footballStatsConfirmLogout") !== "false"
  );

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  function previousSlide() {
    setActiveSlide(
      (current) => (current - 1 + slides.length) % slides.length
    );
  }

  function nextSlide() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

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

  const careerLink = user ? "/dashboard" : "/login";

  function AuthActions({ compact = false }) {
    if (user === undefined) {
      return null;
    }

    if (user) {
      return (
        <Link
          to="/dashboard"
          className={compact ? "landing-register landing-cta" : "landing-register"}
        >
          Minha carreira
        </Link>
      );
    }

    if (compact) {
      return (
        <>
          <Link to="/register" className="landing-register landing-cta">
            Criar conta 
          </Link>
          <Link to="/login" className="landing-secondary">
            Entrar
          </Link>
        </>
      );
    }

    return (
      <>
        <Link to="/login" className="landing-login">
          Entrar
        </Link>
        <Link to="/register" className="landing-register">
          Criar conta
        </Link>
      </>
    );
  }

  return (
    <div className="landing-page">
      <header
        className="landing-header"
        style={{ position: "relative", zIndex: 50 }}
      >
        <Link to="/" className="landing-brand">
          <span>
            Football<span className="landing-brand-green">Stats</span>
          </span>
        </Link>

        <nav
          className="landing-header-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <AuthActions />

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
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
              <span></span>
              <ChevronDown size={15} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    cursor: "default",
                    zIndex: -1,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "min(300px, calc(100vw - 32px))",
                    padding: "10px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    background: "#111a18",
                    color: "#ffffff",
                    boxShadow: "0 16px 45px rgba(0,0,0,0.4)",
                    zIndex: 60,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 10px",
                      borderBottom: "1px solid rgba(255,255,255,0.12)",
                      marginBottom: "6px",
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
                        background: "#16a34a",
                        color: "#ffffff",
                      }}
                    >
                      <UserRound size={21} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {user ? "Minha conta" : "Bem-vindo"}
                      </strong>
                      <span
                        title={user?.email || ""}
                        style={{
                          display: "block",
                          fontSize: "12px",
                          color: "#a7b5ae",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {user?.email || "Entre ou crie sua conta"}
                      </span>
                    </div>
                  </div>

                  {!user && user !== undefined && (
                    <Link
                      to="/login"
                      className="landing-login"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 10px",
                        textDecoration: "none",
                      }}
                    >
                      <UserRound size={18} />
                      Entrar na conta
                    </Link>
                  )}

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
                      color: "#ffffff",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    <Settings size={18} />
                    Preferências
                  </button>

                  {user && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 10px",
                          borderRadius: "8px",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: "14px",
                        }}
                      >
                        <ChartLine size={18} />
                        Minha carreira
                      </Link>

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
                          color: "#f87171",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        <LogOut size={18} />
                        Sair da conta
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section
          className="landing-carousel"
          aria-label="Destaques do FootballStats"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.eyebrow}
              className={`landing-slide ${
                activeSlide === index ? "active" : ""
              }`}
              aria-hidden={activeSlide !== index}
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(3, 9, 9, 0.97) 0%, rgba(3, 9, 9, 0.82) 35%, rgba(3, 9, 9, 0.2) 75%, rgba(3, 9, 9, 0.35) 100%), linear-gradient(0deg, rgba(3, 9, 9, 0.55), transparent 45%), url("${slide.image}")`,
                backgroundPosition: slide.position,
              }}
            >
              <div className="landing-slide-content">
                <div className="landing-badge">
                  <span className="landing-dot" />
                  {slide.eyebrow}
                </div>

                <h1>
                  {index === 0 ? (
                    <>
                      Acompanhe cada jogo. Registre cada{" "}
                      <span>conquista.</span>
                    </>
                  ) : index === 1 ? (
                    <>
                      Transforme seu desempenho em{" "}
                      <span>história.</span>
                    </>
                  ) : (
                    <>
                      Organize sua carreira. Supere seus{" "}
                      <span>limites.</span>
                    </>
                  )}
                </h1>

                <p>{slide.description}</p>

                <div className="landing-actions">
                  <AuthActions compact />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="landing-carousel-arrow landing-carousel-prev"
            onClick={previousSlide}
            aria-label="Slide anterior"
          >
            <ChevronLeft size={25} />
          </button>

          <button
            type="button"
            className="landing-carousel-arrow landing-carousel-next"
            onClick={nextSlide}
            aria-label="Próximo slide"
          >
            <ChevronRight size={25} />
          </button>

          <div className="landing-carousel-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type="button"
                className={`landing-carousel-dot ${
                  activeSlide === index ? "active" : ""
                }`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Ir para o slide ${index + 1}`}
                aria-current={activeSlide === index ? "true" : undefined}
              />
            ))}
          </div>
        </section>

        <section className="landing-features">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="landing-feature" key={title}>
              <Icon size={37} strokeWidth={1.9} />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className="landing-stats">
          <div className="landing-stats-copy">
            <div className="landing-badge">
              ESTATÍSTICAS DA SUA CARREIRA
            </div>
            <h2>
              Sua evolução merece ser vista em <span>números.</span>
            </h2>
            <p>
              Acompanhe jogos, gols, assistências e temporadas. Todas as
              informações da sua carreira organizadas em um só lugar.
            </p>
            <Link to={careerLink} className="landing-outline-button">
              {user ? "Minha carreira" : "Comece agora"}
            </Link>
          </div>

          <div className="landing-stats-preview">
            <div className="landing-preview-profile">
              <div className="landing-preview-avatar">
                <UserRound size={34} />
              </div>
              <div className="landing-preview-player">
                <strong>Sua carreira</strong>
                <span>Seus dados, suas conquistas</span>
              </div>
            </div>

            <div className="landing-preview-metrics">
              <div>
                <ChartLine size={21} />
                <strong>Jogos</strong>
                <span>Registrados</span>
              </div>
              <div>
                <Target size={21} />
                <strong>Gols</strong>
                <span>Marcados</span>
              </div>
              <div>
                <Trophy size={21} />
                <strong>Metas</strong>
                <span>Da carreira</span>
              </div>
            </div>

            <div className="landing-preview-bottom">
              <div className="landing-preview-chart">
                <strong>Evolução da carreira</strong>
                <div className="landing-chart-bars">
                  {[30, 48, 39, 62, 52, 76, 65, 86, 72, 100].map(
                    (height, index) => (
                      <span
                        key={index}
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>
              </div>
              <div className="landing-preview-message">
                <span className="landing-preview-status" />
                <strong>Uma carreira inteira.</strong>
                <p>Cada temporada faz parte da sua história.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <span>
            Football<span className="landing-brand-green">Stats</span>
          </span>
        </Link>
        <p>Sua carreira. Seus números. Seu jogo.</p>
        <Link to={careerLink} className="landing-footer-link">
          {user ? "Minha carreira" : "Começar agora"}
        </Link>
      </footer>

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
            background: "rgba(0,0,0,0.7)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-preferences-title"
            style={{
              width: "100%",
              maxWidth: "430px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              background: "#111a18",
              color: "#ffffff",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
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
                  id="landing-preferences-title"
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
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: "#a7b5ae",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              Personalize algumas opções da sua experiência no FootballStats.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "16px 0",
                borderTop: "1px solid rgba(255,255,255,0.12)",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <ShieldCheck
                size={21}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />

              <div style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: "14px" }}>
                  Confirmar antes de sair
                </strong>
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "13px",
                    color: "#a7b5ae",
                    lineHeight: 1.5,
                  }}
                >
                  Pergunta se você realmente deseja encerrar sua sessão.
                </p>
              </div>

              <input
                type="checkbox"
                checked={confirmLogout}
                onChange={(event) =>
                  toggleConfirmLogout(event.target.checked)
                }
                aria-label="Confirmar antes de sair"
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#16a34a",
                  cursor: "pointer",
                }}
              />
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "#84948b",
                marginTop: "16px",
              }}
            >
              Essa preferência fica salva neste navegador.
            </p>

            <button
              type="button"
              onClick={() => setPreferencesOpen(false)}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "12px 16px",
                border: "none",
                borderRadius: "9px",
                background: "#16a34a",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Concluído
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
