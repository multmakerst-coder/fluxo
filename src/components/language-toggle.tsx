"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
];

export function LanguageToggle() {
  const [current, setCurrent] = useState("pt");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Alterar idioma">
            <Globe className="h-4.5 w-4.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => setCurrent(lang.code)}>
            {lang.label} {current === lang.code && "✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
