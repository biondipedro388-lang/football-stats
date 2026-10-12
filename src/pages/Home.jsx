import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";

export function Home() {
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);

  async function loadPlayers() {
    const querySnapshot = await getDocs(collection(db, "players"));

    const playersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPlayers(playersList);
  }

  async function loadCoaches() {
    const querySnapshot = await getDocs(collection(db, "coaches"));

    const coachesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCoaches(coachesList);
  }

  useEffect(() => {
    loadPlayers();
    loadCoaches();
  }, []);

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
              <p>
                Comece criando o primeiro jogador da sua carreira.
              </p>

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
                    <p className="player-info">
                      {player.nationality}
                    </p>
                    <div className="player-position">
                      {player.position}
                    </div>
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
                    <p className="player-info">
                      {coach.nationality}
                    </p>
                    <div className="player-position">
                      Treinador
                    </div>
                  </div>

                  <div className="player-arrow"></div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}