import { createTheme, ThemeProvider } from "@mui/material";
import { RouterModule } from "./utility/routing/RouterModule";
import "./App.css";
import { Toaster } from "sonner";
import { theme } from "./theme/theme";

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
