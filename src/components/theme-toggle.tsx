"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

// Não há nada a subscrever — só precisamos de distinguir a primeira renderização
// no servidor (onde o tema real ainda não é conhecido) da renderização no cliente.
function subscribeNoop() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {mounted && theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </Button>
  );
}
