
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";

const countries = [
  { name: "Afeganistão", code: "AF" },
  { name: "África do Sul", code: "ZA" },
  { name: "Albânia", code: "AL" },
  { name: "Alemanha", code: "DE" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Argentina", code: "AR" },
  { name: "Austrália", code: "AU" },
  { name: "Áustria", code: "AT" },
  { name: "Bélgica", code: "BE" },
  { name: "Brasil", code: "BR" },
  { name: "Canadá", code: "CA" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Colômbia", code: "CO" },
  { name: "Coreia do Sul", code: "KR" },
  { name: "Croácia", code: "HR" },
  { name: "Dinamarca", code: "DK" },
  { name: "Egito", code: "EG" },
  { name: "Equador", code: "EC" },
  { name: "Espanha", code: "ES" },
  { name: "Estados Unidos", code: "US" },
  { name: "França", code: "FR" },
  { name: "Gana", code: "GH" },
  { name: "Grécia", code: "GR" },
  { name: "Holanda", code: "NL" },
  { name: "Inglaterra", code: "GB" },
  { name: "Itália", code: "IT" },
  { name: "Japão", code: "JP" },
  { name: "Marrocos", code: "MA" },
  { name: "México", code: "MX" },
  { name: "Nigéria", code: "NG" },
  { name: "Noruega", code: "NO" },
  { name: "Paraguai", code: "PY" },
  { name: "Peru", code: "PE" },
  { name: "Polônia", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Reino Unido", code: "GB" },
  { name: "República Tcheca", code: "CZ" },
  { name: "Romênia", code: "RO" },
  { name: "Rússia", code: "RU" },
  { name: "Senegal", code: "SN" },
  { name: "Sérvia", code: "RS" },
  { name: "Suécia", code: "SE" },
  { name: "Suíça", code: "CH" },
  { name: "Turquia", code: "TR" },
  { name: "Ucrânia", code: "UA" },
  { name: "Uruguai", code: "UY" },
  { name: "Venezuela", code: "VE" },
];

const positions = [
  { code: "GOL", name: "Goleiro" },
  { code: "LD", name: "Lateral Direito" },
  { code: "LE", name: "Lateral Esquerdo" },
  { code: "ZAG", name: "Zagueiro" },
  { code: "VOL", name: "Volante" },
  { code: "MC", name: "Meio-Campista" },
  { code: "MEI", name: "Meia" },
  { code: "MD", name: "Meia Direito" },
  { code: "ME", name: "Meia Esquerdo" },
  { code: "PD", name: "Ponta Direita" },
  { code: "PE", name: "Ponta Esquerda" },
  { code: "SA", name: "Segundo Atacante" },
  { code: "CA", name: "Centroavante" },
];

function CreatePlayer() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("");
  const [position, setPosition] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [preferredFoot, setPreferredFoot] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !name ||
      !nationality ||
      !position ||
      !birthDate ||
      !preferredFoot
    ) {
      return;
    }

    await addDoc(collection(db, "players"), {
      name: name,
      nationality: nationality,
      position: position,
      birthDate: birthDate,
      preferredFoot: preferredFoot,
      createdAt: new Date(),
    });

    navigate("/");
  }

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/")}
        >
          Voltar
        </button>

        <div className="brand">
          <span className="brand-icon">⚽</span>

          <span>
            Football<span className="brand-green">Stats</span>
          </span>
        </div>

        <div className="topbar-spacer"></div>
      </header>

      <main className="form-page">
        <div className="form-header">
          <span className="section-label">DATABASE • JOGADORES</span>

          <h1>Novo jogador</h1>

          <p>
            Crie o perfil do jogador e comece a registrar sua carreira.
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-section-title">
                <span>Informações pessoais</span>
              </div>

              <div className="form-grid">
                <div className="form-group form-full">
                  <label>Nome completo</label>

                  <input
                    className="input"
                    type="text"
                    placeholder="Ex: Pedro Biondi"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Nacionalidade</label>

                  <select
                    className="select"
                    value={nationality}
                    onChange={(event) => setNationality(event.target.value)}
                  >
                    <option value="">Selecione o país</option>

                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Posição</label>

                  <select
                    className="select"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                  >
                    <option value="">Selecione a posição</option>

                    {positions.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} — {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Data de nascimento</label>

                  <input
                    className="input"
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Pé dominante</label>

                  <select
                    className="select"
                    value={preferredFoot}
                    onChange={(event) => setPreferredFoot(event.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="Direito">Direito</option>
                    <option value="Esquerdo">Esquerdo</option>
                    <option value="Ambidestro">Ambidestro</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() => navigate("/")}
              >
                Cancelar
              </button>

              <button className="button" type="submit">
                Criar jogador
                <span></span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreatePlayer;
