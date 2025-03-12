import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Portfolio from "./components/Portfolio";
import ThemeWrapper from "./components/ThemeWrapper";
import NeonBackground from "./components/NeonBackground"; // Nowy komponent

function App() {
  return (
    <Provider store={store}>
      <ThemeWrapper>
        <NeonBackground>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </BrowserRouter>
        </NeonBackground>
      </ThemeWrapper>
    </Provider>
  );
}

export default App;
