import {
  HomePage,
  LoginPage,
  RegisterPage,
  ChatsPage,
  ProfilePage,
  UserInfoPage,
  LoadingPage,
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
        {
          path: "/user/:id",
          element: (
            <ProtectedRoute>
              <UserInfoPage />
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
  if (isloading) return <LoadingPage />;
  return <RouterProvider router={router} />;
};

export default App;
