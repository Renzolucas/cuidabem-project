import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { MedicineList } from "./components/MedicineList";
import { AddMedicine } from "./components/AddMedicine";
import { MedicineDetails } from "./components/MedicineDetails";
import { Schedules } from "./components/Schedules";
import { ProfilePage } from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: MedicineList },
      { path: "adicionar", Component: AddMedicine },
      { path: "remedio/:id", Component: MedicineDetails },
      { path: "horarios", Component: Schedules },
      { path: "perfil", Component: ProfilePage },
    ],
  },
]);
