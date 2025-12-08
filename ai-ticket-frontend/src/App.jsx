import { Routes, Route } from "react-router-dom";
import CheckAuth from "./components/check-auth.jsx";
import Tickets from "./pages/tickets.jsx";
import TicketDetailsPage from "./pages/ticket.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Admin from "./pages/admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <CheckAuth protected={true}>
            <Tickets />
          </CheckAuth>
        }
      />

      <Route
        path="/tickets/:id"
        element={
          <CheckAuth protected={true}>
            <TicketDetailsPage />
          </CheckAuth>
        }
      />

      <Route
        path="/login"
        element={
          <CheckAuth protected={false}>
            <Login />
          </CheckAuth>
        }
      />

      <Route
        path="/signup"
        element={
          <CheckAuth protected={false}>
            <Signup />
          </CheckAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <CheckAuth protected={true}>
            <Admin />
          </CheckAuth>
        }
      />
    </Routes>
  );
}
