import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Fluxo recolhe, utiliza e protege os teus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-bold">Política de Privacidade</h1>
      <p className="mt-3 text-sm text-muted-foreground">Última atualização: 15 de julho de 2026</p>

      <div className="mt-10 flex flex-col gap-8 text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold text-foreground">1. Quem somos</h2>
          <p className="mt-3 leading-relaxed">
            O Fluxo é responsável pelo tratamento dos dados pessoais recolhidos através do website
            e da plataforma. Esta Política de Privacidade explica que dados recolhemos, para que
            fins os utilizamos e quais os teus direitos, em conformidade com o Regulamento Geral
            sobre a Proteção de Dados (RGPD).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">2. Dados que recolhemos</h2>
          <ul className="mt-3 ml-5 flex list-disc flex-col gap-2">
            <li>Dados de conta: nome, email, palavra-passe encriptada e dados da empresa;</li>
            <li>Dados de faturação: informação de pagamento, processada por prestadores terceiros certificados;</li>
            <li>Dados de utilização: interações com a plataforma, fluxos criados e métricas de desempenho;</li>
            <li>Dados de contactos importados por ti (clientes, leads) para efeitos de automação;</li>
            <li>Dados técnicos: endereço IP, tipo de dispositivo e navegador.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">3. Como utilizamos os dados</h2>
          <p className="mt-3 leading-relaxed">Utilizamos os teus dados para:</p>
          <ul className="mt-3 ml-5 flex list-disc flex-col gap-2">
            <li>Fornecer, manter e melhorar o Serviço;</li>
            <li>Processar pagamentos e gerir a tua subscrição;</li>
            <li>Comunicar contigo sobre atualizações, suporte e questões de faturação;</li>
            <li>Garantir a segurança da plataforma e prevenir utilização abusiva;</li>
            <li>Cumprir obrigações legais e fiscais aplicáveis.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">4. Base legal do tratamento</h2>
          <p className="mt-3 leading-relaxed">
            Tratamos os teus dados com base na execução do contrato de subscrição, no cumprimento
            de obrigações legais, no nosso interesse legítimo em melhorar o Serviço e, quando
            aplicável, no teu consentimento explícito, nomeadamente para comunicações de
            marketing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">5. Partilha de dados</h2>
          <p className="mt-3 leading-relaxed">
            Não vendemos os teus dados pessoais. Podemos partilhar dados com prestadores de
            serviços essenciais ao funcionamento da plataforma (alojamento, processamento de
            pagamentos, envio de mensagens através das APIs oficiais do WhatsApp, Instagram e
            Email), sempre sujeitos a acordos de confidencialidade e proteção de dados.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">6. Retenção de dados</h2>
          <p className="mt-3 leading-relaxed">
            Conservamos os teus dados pelo período necessário para prestar o Serviço e cumprir
            obrigações legais. Após o encerramento da conta, os dados são eliminados ou
            anonimizados num prazo razoável, exceto quando a lei exigir a sua conservação por mais
            tempo.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">7. Os teus direitos</h2>
          <p className="mt-3 leading-relaxed">
            Nos termos do RGPD, tens direito a aceder, retificar, apagar, limitar o tratamento,
            opor-te ao tratamento e solicitar a portabilidade dos teus dados. Podes exercer estes
            direitos contactando{" "}
            <a href="mailto:privacidade@fluxo.pt" className="text-primary hover:underline">
              privacidade@fluxo.pt
            </a>
            . Tens também o direito de apresentar reclamação junto da Comissão Nacional de
            Proteção de Dados (CNPD).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">8. Segurança</h2>
          <p className="mt-3 leading-relaxed">
            Implementamos medidas técnicas e organizativas adequadas para proteger os teus dados
            contra acesso não autorizado, perda ou destruição, incluindo encriptação em trânsito e
            em repouso e controlo de acessos.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">9. Transferências internacionais</h2>
          <p className="mt-3 leading-relaxed">
            Alguns dos nossos prestadores de serviços podem estar localizados fora do Espaço
            Económico Europeu. Nesses casos, garantimos que existem salvaguardas adequadas, como
            cláusulas contratuais-tipo aprovadas pela Comissão Europeia.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">10. Alterações a esta política</h2>
          <p className="mt-3 leading-relaxed">
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos alterações
            significativas através do email associado à tua conta.
          </p>
        </div>
      </div>
    </section>
  );
}
