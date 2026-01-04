import { HomePage, LoginPage, RegisterPage } from "./pages";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatsPage from "./pages/ChatsPage";
import AppLayout from "./layouts/AppLayout";
const App = () => {
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
          element: <ChatsPage />,
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
  return <RouterProvider router={router} />;
};

export default App;
