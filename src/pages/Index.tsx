import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";

export default function Index() {
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser());
  useEffect(() => {
    navigate(user ? "/dashboard" : "/login", { replace: true });
  }, [user, navigate]);
  return null;
}
