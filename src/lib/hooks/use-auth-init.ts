import { useEffect } from "react";

export function useAuthInit() {
  useEffect(() => {
    const hasToken = !!localStorage.getItem("classified.auth.token");

    if (hasToken && window.location.pathname !== "/home") {
      window.location.href = "/home";
    }
  }, []);
}
