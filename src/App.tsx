import AppRoutes from "./routes/AppRoutes";
import { DroneSurveyProvider } from "./context/DroneSurveyContext";

function App() {
  return (
    <DroneSurveyProvider>
      <AppRoutes />
    </DroneSurveyProvider>
  );
}

export default App;