import {
  HomePage,
  LoginPage,
  RegisterPage,
  ChatsPage,
  ProfilePage,
} from "./pages";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./providers/AuthProvider";

const App = () => {
  const { isloading } = useAuth();
  let router = createBrowserRouter([
    {
      element: <AppLayout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/chats",
          element: (
            <ProtectedRoute>
              <ChatsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile",
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);
  if (isloading) return <div className="bg-slate-900 h-screen">Loading...</div>;
  return <RouterProvider router={router} />;
};

export default App;
