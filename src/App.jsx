import { createTheme, ThemeProvider } from "@mui/material";
import { RouterModule } from "./utility/routing/RouterModule";
import "./App.css";
import { Toaster } from "sonner";
import { theme } from "./theme/theme";
import Echo from "laravel-echo";

import Pusher from "pusher-js";
window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT,
  wssPort: import.meta.env.VITE_REVERB_PORT,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
  enabledTransports: ["ws", "wss"],

  // ✅ For Sanctum
  withCredentials: true,
  authEndpoint: "http://10.10.12.12:8009/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  },
});

window.Echo.connector.pusher.connection.bind("connected", () => {
  console.log("Echo connected!");
});

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <ThemeProvider theme={theme}>
        <RouterModule />
      </ThemeProvider>
    </>
  );
}

export default App;
