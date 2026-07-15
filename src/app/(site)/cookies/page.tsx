import type { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Como o Fluxo utiliza cookies e tecnologias semelhantes.",
};

const COOKIE_TABLE = [
  { name: "fluxo_session", purpose: "Manter a tua sessão iniciada de forma segura.", duration: "Sessão" },
  { name: "fluxo_theme", purpose: "Guardar a tua preferência de tema (claro/escuro).", duration: "1 ano" },
  { name: "fluxo_lang", purpose: "Guardar a tua preferência de idioma.", duration: "1 ano" },
  { name: "_ga", purpose: "Análise agregada de utilização do website (Google Analytics).", duration: "13 meses" },
];

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-bold">Política de Cookies</h1>
      <p className="mt-3 text-sm text-muted-foreground">Última atualização: 15 de julho de 2026</p>

      <div className="mt-10 flex flex-col gap-8 text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold text-foreground">1. O que são cookies</h2>
          <p className="mt-3 leading-relaxed">
            Cookies são pequenos ficheiros de texto armazenados no teu dispositivo quando visitas
            um website. Permitem que a plataforma se lembre das tuas ações e preferências ao longo
            do tempo, melhorando a tua experiência de utilização.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">2. Que tipos de cookies utilizamos</h2>
          <p className="mt-3 leading-relaxed">Utilizamos as seguintes categorias de cookies:</p>
          <ul className="mt-3 ml-5 flex list-disc flex-col gap-2">
            <li>
              <strong className="text-foreground">Cookies essenciais</strong> — necessários para o
              funcionamento básico da plataforma, incluindo autenticação e segurança;
            </li>
            <li>
              <strong className="text-foreground">Cookies de preferências</strong> — guardam
              definições como tema e idioma escolhido;
            </li>
            <li>
              <strong className="text-foreground">Cookies analíticos</strong> — ajudam-nos a
              perceber como o website é utilizado, de forma agregada e anónima, para melhorarmos o
              Serviço.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">3. Cookies que utilizamos</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Finalidade</TableHead>
                  <TableHead>Duração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COOKIE_TABLE.map((cookie) => (
                  <TableRow key={cookie.name}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{cookie.name}</TableCell>
                    <TableCell className="whitespace-normal">{cookie.purpose}</TableCell>
                    <TableCell className="whitespace-nowrap">{cookie.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">4. Como gerir os cookies</h2>
          <p className="mt-3 leading-relaxed">
            Podes gerir ou desativar cookies através das definições do teu navegador. Nota que
            desativar cookies essenciais pode afetar o funcionamento correto da plataforma,
            impedindo, por exemplo, que a tua sessão se mantenha iniciada.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">5. Cookies de terceiros</h2>
          <p className="mt-3 leading-relaxed">
            Alguns cookies são colocados por serviços de terceiros que aparecem nas nossas
            páginas, como ferramentas de análise. Não temos controlo direto sobre estes cookies —
            consulta as políticas de privacidade desses terceiros para mais informação.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">6. Alterações a esta política</h2>
          <p className="mt-3 leading-relaxed">
            Podemos atualizar esta Política de Cookies periodicamente para refletir alterações na
            forma como utilizamos cookies. Recomendamos que a consultes regularmente.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">7. Contactos</h2>
          <p className="mt-3 leading-relaxed">
            Para questões sobre esta Política de Cookies, contacta-nos através de{" "}
            <a href="mailto:privacidade@fluxo.pt" className="text-primary hover:underline">
              privacidade@fluxo.pt
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
