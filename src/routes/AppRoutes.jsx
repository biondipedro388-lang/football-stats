import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "../pages/Home";
import CreatePlayer from "../pages/CreatePlayer";
import { PlayerProfile } from "../pages/PlayerProfile";
import { AddSeason } from "../pages/AddSeason";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/new-player"
          element={<CreatePlayer />}
        />

        <Route
          path="/player/:id"
          element={<PlayerProfile />}
        />

        <Route
          path="/player/:id/add-season"
          element={<AddSeason />}
        />
      </Routes>
    </BrowserRouter>
  );
}
