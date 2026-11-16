import React from "react";
import { createRoot } from "react-dom/client";
import UiGalleryPage from "./gallery.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UiGalleryPage />
  </React.StrictMode>,
);
