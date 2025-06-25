import { createTheme, ThemeProvider } from "@mui/material";
import { RouterModule } from "./utility/routing/RouterModule";
import "./App.css";

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
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: {
            "&.Mui-focused": {
              color: "#000000",
            },
            "&.Mui-error": {
              color: "#d32f2f", // MUI default error red
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#000000",
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderColor: "#d32f2f", // red border on error
            },
          },
        },
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
