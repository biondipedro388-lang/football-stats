import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../services/firebase";

function calculateAge(birthDate) {
  if (!birthDate) {
    return "-";
  }

  const today = new Date();
  const birth = new Date(birthDate + "T00:00:00");

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference = today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

function formatBirthDate(birthDate) {
  if (!birthDate) {
    return "-";
  }

  const parts = birthDate.split("-");

  if (parts.length !== 3) {
    return birthDate;
  }

  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function getNationalityName(code) {
  const countries = {
    AF: "Afeganistão",
    ZA: "África do Sul",
    AL: "Albânia",
    DE: "Alemanha",
    AR: "Argentina",
    AU: "Austrália",
    AT: "Áustria",
    BE: "Bélgica",
    BR: "Brasil",
    CA: "Canadá",
    CL: "Chile",
    CN: "China",
    CO: "Colômbia",
    KR: "Coreia do Sul",
    HR: "Croácia",
    DK: "Dinamarca",
    EG: "Egito",
    EC: "Equador",
    ES: "Espanha",
    US: "Estados Unidos",
    FR: "França",
    GH: "Gana",
    GR: "Grécia",
    NL: "Países Baixos",
    IN: "Índia",
    ID: "Indonésia",
    IE: "Irlanda",
    IT: "Itália",
    JP: "Japão",
    MA: "Marrocos",
    MX: "México",
    NG: "Nigéria",
    NO: "Noruega",
    PY: "Paraguai",
    PE: "Peru",
    PL: "Polônia",
    PT: "Portugal",
    GB: "Reino Unido",
    CZ: "República Tcheca",
    RO: "Romênia",
    RU: "Rússia",
    SN: "Senegal",
    RS: "Sérvia",
    SE: "Suécia",
    CH: "Suíça",
    TR: "Turquia",
    UA: "Ucrânia",
    UY: "Uruguai",
    VE: "Venezuela",
  };

  return countries[code] || code;
}

function getPositionName(code) {
  const positions = {
    GOL: "Goleiro",
    LD: "Lateral Direito",
    LE: "Lateral Esquerdo",
    ZAG: "Zagueiro",
    VOL: "Volante",
    MC: "Meio-Campista",
    MEI: "Meia",
    MD: "Meia Direito",
    ME: "Meia Esquerdo",
    PD: "Ponta Direita",
    PE: "Ponta Esquerda",
    SA: "Segundo Atacante",
    CA: "Centroavante",
  };

  return positions[code] || code;
}

export function PlayerProfile() {
  const { id } = useParams();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadPlayer() {
    try {
      const docRef = doc(db, "players", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPlayer({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }
    } catch (error) {
      console.error("Erro ao carregar jogador:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Carregando jogador...</h3>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page">
        <div className="header">
          <div className="logo">
            Football<span>Stats</span>
          </div>
        </div>

        <div className="empty-state">
          <h3>Jogador não encontrado</h3>

          <p>
            Não foi possível encontrar esse jogador no banco de dados.
          </p>

          <Link to="/" className="button">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const age = calculateAge(player.birthDate);
  const birthDate = formatBirthDate(player.birthDate);
  const nationality = getNationalityName(player.nationality);
  const position = getPositionName(player.position);

  return (
    <div className="page">
      <header className="header">
        <Link to="/" className="logo">
          Football<span>Stats</span>
        </Link>

        <Link to="/" className="button">
          ← Voltar
        </Link>
      </header>

      <main>
        <section className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {player.name?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-main">
              <span className="profile-label">JOGADOR</span>

              <h1 className="profile-name">
                {player.name}
              </h1>

              <p className="profile-subtitle">
                {nationality} • {position}
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-box">
              <span>Data de nascimento</span>
              <strong>{birthDate}</strong>
            </div>

            <div className="profile-info-box">
              <span>Idade</span>
              <strong>{age} anos</strong>
            </div>

            <div className="profile-info-box">
              <span>Posição</span>
              <strong>{position}</strong>
            </div>

            <div className="profile-info-box">
              <span>Pé dominante</span>
              <strong>{player.preferredFoot}</strong>
            </div>
          </div>
        </section>

        <section className="career-section">
          <div className="section-header">
            <div>
              <span className="section-label">CARREIRA</span>
              <h2>Estatísticas</h2>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>JOGOS</span>
              <strong>0</strong>
            </div>

            <div className="stat-card">
              <span>GOLS</span>
              <strong>0</strong>
            </div>

            <div className="stat-card">
              <span>ASSISTÊNCIAS</span>
              <strong>0</strong>
            </div>

            <div className="stat-card">
              <span>TÍTULOS</span>
              <strong>0</strong>
            </div>
          </div>
        </section>

        <section className="career-section">
          <div className="section-header">
            <div>
              <span className="section-label">CARREIRA</span>
              <h2>Histórico de temporadas</h2>
            </div>

            <Link
              to={"/player/" + player.id + "/add-season"}
              className="button"
            >
              + Adicionar temporada
            </Link>
          </div>

          <div className="empty-state">
            <h3>Nenhuma temporada registrada</h3>

            <p>
              As temporadas, clubes, seleção, jogos, gols e
              assistências aparecerão aqui.
            </p>
          </div>
        </section>

        <section className="career-section">
          <div className="section-header">
            <div>
              <span className="section-label">CONQUISTAS</span>
              <h2>Títulos e prêmios</h2>
            </div>
          </div>

          <div className="empty-state">
            <h3>Nenhum título ou prêmio registrado</h3>

            <p>
              Os títulos conquistados e prêmios individuais
              aparecerão aqui.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}