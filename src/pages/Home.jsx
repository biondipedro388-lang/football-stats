import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
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

  async function createPlayer() {
    await addDoc(collection(db, "players"), {
      name: "Novo Jogador",
      nationality: "Brasil",
      position: "Meia",
      overall: 75,
      goals: 0,
      assists: 0,
    });

    loadPlayers();
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  return (
    <div>
      <h1>Football Stats</h1>

      <button onClick={createPlayer}>
        Criar Jogador Teste
      </button>

      <h2>Jogadores</h2>

      {players.map((player) => (
        <div key={player.id}>
          <h3>{player.name}</h3>
          <p>Posição: {player.position}</p>
          <p>Overall: {player.overall}</p>
        </div>
      ))}
    </div>
  );
}