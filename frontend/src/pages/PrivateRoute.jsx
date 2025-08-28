// PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

export default function PrivateRoute({ children }) {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
