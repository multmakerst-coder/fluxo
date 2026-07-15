import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="hero-gradient blur-orb pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full"
      />
      <div
        aria-hidden
        className="dark-section-gradient blur-orb pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full opacity-20"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
