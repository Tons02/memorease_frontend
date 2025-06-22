import { createTheme, ThemeProvider } from "@mui/material";
import { RouterModule } from "./utility/routing/RouterModule";

function App() {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        light: "#FAF7C1",
        main: "#FAF7C1",
        contrastText: "#fff",
      },
      secondary: {
        light: "#55dab3",
        main: "#1D6E29",
        dark: "#007856",
        contrastText: "#000",
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <RouterModule />
      </ThemeProvider>
    </>
  );
}

export default App;
