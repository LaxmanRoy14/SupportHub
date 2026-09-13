import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";

import App from "./App";
import { store } from "./app/store";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider><BrowserRouter><App /></BrowserRouter></ThemeProvider>
    </Provider>
  </StrictMode>,
);
