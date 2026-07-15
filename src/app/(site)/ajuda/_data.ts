import { Rocket, MessageCircle, Camera, Mail, CreditCard, type LucideIcon } from "lucide-react";

export interface HelpCategory {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface HelpArticle {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: "primeiros-passos",
    label: "Primeiros passos",
    description: "Cria a tua conta e configura o Fluxo pela primeira vez.",
    icon: Rocket,
  },
  {
    slug: "whatsapp",
    label: "WhatsApp",
    description: "Liga o WhatsApp Business e configura automações.",
    icon: MessageCircle,
  },
  {
    slug: "instagram",
    label: "Instagram",
    description: "Automatiza comentários, DMs e menções em stories.",
    icon: Camera,
  },
  {
    slug: "email",
    label: "Email",
    description: "Cria sequências, newsletters e follow-ups.",
    icon: Mail,
  },
  {
    slug: "faturacao",
    label: "Faturação",
    description: "Planos, pagamentos e faturas.",
    icon: CreditCard,
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "criar-conta-fluxo",
    category: "primeiros-passos",
    title: "Como criar a tua conta no Fluxo",
    excerpt: "Passo a passo para criares a tua conta gratuita em menos de 2 minutos.",
    content: `Para criares a tua conta no Fluxo, acede à página de registo e introduz o teu email profissional e uma palavra-passe segura. Vais receber um email de verificação — confirma o teu endereço para desbloqueares o painel completo.

Depois de confirmares o email, vais ser guiado por um pequeno assistente de configuração inicial, onde podes ligar o teu primeiro canal (WhatsApp, Instagram ou Email) e criar o teu primeiro fluxo de automação.

Não é necessário cartão de crédito para o plano Gratuito.`,
  },
  {
    slug: "configurar-perfil-e-equipa",
    category: "primeiros-passos",
    title: "Configurar o perfil da empresa e convidar a equipa",
    excerpt: "Personaliza o teu espaço de trabalho e adiciona colegas de equipa.",
    content: `No menu de definições, acede a "Perfil da empresa" para adicionares o nome, logótipo e horário de funcionamento do teu negócio — esta informação é usada em algumas respostas automáticas.

Para convidares a tua equipa, vai a "Definições > Equipa" e introduz o email dos teus colegas. Nos planos Pro e Empresas, podes atribuir diferentes níveis de permissão a cada membro da equipa.`,
  },
  {
    slug: "ligar-whatsapp-business",
    category: "whatsapp",
    title: "Como ligar a tua conta de WhatsApp Business",
    excerpt: "Liga o WhatsApp Business API ao Fluxo em poucos minutos.",
    content: `Acede a "Canais > WhatsApp" no teu painel e clica em "Ligar número". Vais precisar de um número de telefone dedicado que ainda não esteja associado a uma conta pessoal do WhatsApp.

Segue os passos de verificação apresentados no ecrã, que incluem confirmar o número por SMS ou chamada. Após a ligação, o número fica automaticamente disponível para automações, broadcasts e live chat.

Nota: números pessoais do WhatsApp não são compatíveis com a API oficial — é necessário usar a versão Business.`,
  },
  {
    slug: "criar-fluxo-whatsapp",
    category: "whatsapp",
    title: "Criar o teu primeiro fluxo de automação no WhatsApp",
    excerpt: "Aprende a desenhar um fluxo simples de resposta automática.",
    content: `No editor de fluxos, escolhe o gatilho "Nova mensagem recebida" e adiciona um bloco de resposta com o texto de boas-vindas. Podes depois adicionar um bloco de menu com opções para o cliente escolher, cada uma levando a um caminho diferente do fluxo.

Testa sempre o fluxo antes de o ativares, usando o modo de pré-visualização disponível no canto superior direito do editor.`,
  },
  {
    slug: "comentario-para-dm-instagram",
    category: "instagram",
    title: "Configurar automação de comentário para DM",
    excerpt: "Transforma comentários em conversas privadas automaticamente.",
    content: `Em "Canais > Instagram > Automações", cria uma nova regra e escolhe a publicação (ou todas as publicações futuras) que queres monitorizar. Define a palavra-chave que despoleta a automação, por exemplo "quero" ou "info".

Sempre que alguém comentar com essa palavra-chave, o Fluxo envia automaticamente uma DM com a mensagem que configurares, incluindo links ou informação adicional.`,
  },
  {
    slug: "gerir-dms-instagram",
    category: "instagram",
    title: "Gerir a caixa de entrada de DMs do Instagram",
    excerpt: "Centraliza e organiza as mensagens diretas da tua conta.",
    content: `Todas as DMs recebidas ficam disponíveis na secção "Caixa de entrada" do teu painel, juntamente com as conversas de WhatsApp e Email. Podes atribuir conversas a membros da equipa, adicionar etiquetas e consultar o histórico completo do contacto.

Usa o live chat para assumires manualmente qualquer conversa que esteja a decorrer através de um fluxo automático.`,
  },
  {
    slug: "criar-sequencia-email",
    category: "email",
    title: "Criar uma sequência de emails automática",
    excerpt: "Configura uma série de emails acionados por comportamento.",
    content: `Acede a "Canais > Email > Sequências" e clica em "Nova sequência". Escolhe o gatilho, por exemplo "Novo subscritor" ou "Compra realizada", e adiciona os emails que queres enviar, definindo o intervalo de tempo entre cada um.

Podes usar o editor visual para desenhar cada email sem necessidade de conhecimentos de HTML.`,
  },
  {
    slug: "enviar-newsletter",
    category: "email",
    title: "Como enviar uma newsletter",
    excerpt: "Cria e agenda newsletters para a tua lista de contactos.",
    content: `Em "Canais > Email > Newsletters", cria uma nova campanha, escolhe o segmento de contactos a quem queres enviar e desenha o conteúdo no editor visual.

Podes agendar o envio para uma data e hora específica, ou enviar imediatamente. Os relatórios de abertura e cliques ficam disponíveis na secção de Analytics após o envio.`,
  },
  {
    slug: "planos-e-precos",
    category: "faturacao",
    title: "Diferenças entre os planos Gratuito, Pro e Empresas",
    excerpt: "Percebe o que está incluído em cada plano do Fluxo.",
    content: `O plano Gratuito é ideal para testares a plataforma, com até 500 contactos e um canal ativo. O plano Pro desbloqueia contactos ilimitados, todos os canais, broadcasts e respostas com inteligência artificial.

O plano Empresas é personalizado para equipas maiores, com API própria, multi-utilizador e onboarding dedicado. Consulta a página de preços para uma comparação completa.`,
  },
  {
    slug: "alterar-plano-ou-cancelar",
    category: "faturacao",
    title: "Como alterar o teu plano ou cancelar a subscrição",
    excerpt: "Faz upgrade, downgrade ou cancela a qualquer momento.",
    content: `Acede a "Definições > Faturação" para consultares o teu plano atual. Podes fazer upgrade imediatamente, com o valor a ser calculado de forma proporcional ao tempo restante do ciclo atual.

Para cancelares, clica em "Cancelar subscrição" — o teu acesso mantém-se ativo até ao final do período já pago, após o qual a conta passa automaticamente para o plano Gratuito.`,
  },
];
