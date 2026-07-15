import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: "Termos e condições de utilização da plataforma Fluxo.",
};

export default function TermosPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-bold">Termos de Serviço</h1>
      <p className="mt-3 text-sm text-muted-foreground">Última atualização: 15 de julho de 2026</p>

      <div className="mt-10 flex flex-col gap-8 text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
          <p className="mt-3 leading-relaxed">
            Estes Termos de Serviço (&quot;Termos&quot;) regulam o acesso e a utilização da
            plataforma Fluxo, incluindo o website, o painel de controlo e todas as funcionalidades
            associadas (em conjunto, o &quot;Serviço&quot;), disponibilizado pelo Fluxo
            (&quot;nós&quot;, &quot;o Fluxo&quot;). Ao criares uma conta ou utilizares o Serviço,
            aceitas ficar vinculado a estes Termos. Se não concordares com alguma disposição, não
            deves utilizar o Serviço.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">2. Elegibilidade e conta</h2>
          <p className="mt-3 leading-relaxed">
            Para utilizares o Fluxo tens de ter, pelo menos, 18 anos e capacidade legal para
            celebrar contratos vinculativos. És responsável por manter a confidencialidade das
            credenciais da tua conta e por todas as atividades realizadas através dela. Deves
            notificar-nos imediatamente em caso de utilização não autorizada.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">3. Descrição do Serviço</h2>
          <p className="mt-3 leading-relaxed">
            O Fluxo é uma plataforma de automação de conversas que permite ligar canais como
            WhatsApp, Instagram e Email, criar fluxos de automação, enviar campanhas e gerir
            contactos. As funcionalidades disponíveis dependem do plano de subscrição escolhido,
            conforme descrito na página de preços.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">4. Planos, preços e faturação</h2>
          <p className="mt-3 leading-relaxed">
            Alguns recursos do Serviço estão disponíveis mediante o pagamento de uma subscrição
            recorrente, mensal ou anual, conforme os valores apresentados na página de preços. Os
            preços podem ser alterados mediante aviso prévio razoável. O cancelamento de uma
            subscrição paga mantém o acesso às funcionalidades contratadas até ao final do período
            já pago.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">5. Utilização aceitável</h2>
          <p className="mt-3 leading-relaxed">Ao utilizares o Fluxo, comprometes-te a não:</p>
          <ul className="mt-3 ml-5 flex list-disc flex-col gap-2">
            <li>Enviar mensagens não solicitadas (spam) ou conteúdo enganoso;</li>
            <li>Violar as políticas de utilização do WhatsApp, Instagram ou de qualquer canal integrado;</li>
            <li>Utilizar o Serviço para fins ilegais, fraudulentos ou que violem direitos de terceiros;</li>
            <li>Tentar aceder indevidamente a sistemas, dados ou contas de outros utilizadores;</li>
            <li>Realizar engenharia reversa ou copiar a plataforma para fins concorrentes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">6. Propriedade intelectual</h2>
          <p className="mt-3 leading-relaxed">
            Todos os direitos de propriedade intelectual sobre a plataforma Fluxo, incluindo
            marca, design, código e conteúdos, pertencem ao Fluxo ou aos seus licenciadores. Os
            dados e conteúdos que carregas para a plataforma (contactos, mensagens, fluxos)
            permanecem tua propriedade.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">7. Suspensão e cancelamento</h2>
          <p className="mt-3 leading-relaxed">
            Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos,
            especialmente em caso de utilização abusiva do Serviço. Podes cancelar a tua conta a
            qualquer momento nas definições de faturação do teu painel.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">8. Limitação de responsabilidade</h2>
          <p className="mt-3 leading-relaxed">
            O Serviço é fornecido &quot;tal como está&quot;, sem garantias de qualquer tipo. Na
            medida máxima permitida por lei, o Fluxo não será responsável por danos indiretos,
            incidentais ou consequenciais resultantes da utilização ou impossibilidade de
            utilização do Serviço.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">9. Alterações aos Termos</h2>
          <p className="mt-3 leading-relaxed">
            Podemos atualizar estes Termos periodicamente. Notificaremos alterações
            significativas através do email associado à tua conta ou de um aviso na plataforma. A
            utilização continuada do Serviço após a alteração constitui aceitação dos novos Termos.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">10. Lei aplicável</h2>
          <p className="mt-3 leading-relaxed">
            Estes Termos regem-se pela lei portuguesa. Quaisquer litígios emergentes serão
            submetidos ao foro competente, sem prejuízo de disposições legais imperativas
            aplicáveis a consumidores.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">11. Contactos</h2>
          <p className="mt-3 leading-relaxed">
            Para questões sobre estes Termos, contacta-nos através de{" "}
            <a href="mailto:suporte@fluxo.pt" className="text-primary hover:underline">
              suporte@fluxo.pt
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
