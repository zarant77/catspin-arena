import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./state/storeContext";
import { startAnimatedPawFavicon } from "./components/favicon/animatedFavicon";

startAnimatedPawFavicon();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
