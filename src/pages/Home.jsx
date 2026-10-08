import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";

export function Home() {
  const [players, setPlayers] = useState([]);

  async function loadPlayers() {
    const querySnapshot = await getDocs(collection(db, "players"));

    const playersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPlayers(playersList);
  }

  useEffect(() => {
    loadPlayers();
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

        <Link to="/new-player" className="button">
          + Novo Jogador
        </Link>
      </header>

      <main>
        <h2 className="section-title">Jogadores</h2>

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
                  <div className="player-position">
                    {player.position}
                  </div>
                </div>

                <div className="player-arrow"></div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}