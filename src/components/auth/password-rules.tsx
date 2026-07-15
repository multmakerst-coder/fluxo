import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const PASSWORD_RULES = [
  { id: "length", label: "Mínimo de 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "uppercase", label: "Uma letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "Um número", test: (v: string) => /[0-9]/.test(v) },
] as const;

export function passwordMeetsAllRules(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {PASSWORD_RULES.map((rule) => {
        const valid = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              valid ? "text-success" : "text-muted-foreground",
            )}
          >
            {valid ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
