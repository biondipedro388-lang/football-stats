import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  function previousSlide() {
    setActiveSlide(
      (current) => (current - 1 + slides.length) % slides.length
    );
  }

  function nextSlide() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const careerLink = user ? "/dashboard" : "/login";

  function AuthActions({ compact = false }) {
    if (user === undefined) {
      return null;
    }

    if (user) {
      return (
        <Link
          to="/dashboard"
          className={
            compact
              ? "landing-register landing-cta"
              : "landing-register"
          }
        >
          Minha carreira 
        </Link>
      );
    }

    if (compact) {
      return (
        <>
          <Link to="/register" className="landing-register landing-cta">
            Criar conta <ArrowRight size={19} />
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
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <span>
            Football<span className="landing-brand-green">Stats</span>
          </span>
        </Link>

        <nav className="landing-header-actions">
          <AuthActions />
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
              {user ? "Minha carreira" : "Comece agora"}{" "}
              
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
          {user ? "Minha carreira" : "Começar agora"}{" "}
        </Link>
      </footer>
    </div>
  );
}