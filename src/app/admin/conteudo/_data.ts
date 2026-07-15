export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  content: string;
  publishedAt: string;
  status: "publicado" | "rascunho";
}

export const BLOG_CATEGORIES = ["Automação", "WhatsApp", "Marketing", "Produto", "Casos de sucesso"];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "5 formas de automatizar o atendimento no WhatsApp",
    excerpt: "Descobre como reduzir o tempo de resposta e aumentar a satisfação dos teus clientes.",
    category: "WhatsApp",
    content: "Conteúdo completo sobre automação de atendimento no WhatsApp...",
    publishedAt: "2026-06-02T10:00:00",
    status: "publicado",
  },
  {
    id: "post-2",
    title: "Como criar o teu primeiro fluxo de boas-vindas",
    excerpt: "Um guia passo a passo para configurar uma sequência de boas-vindas eficaz.",
    category: "Automação",
    content: "Conteúdo completo sobre fluxos de boas-vindas...",
    publishedAt: "2026-06-18T09:30:00",
    status: "publicado",
  },
  {
    id: "post-3",
    title: "Instagram Direct para negócios: o guia completo",
    excerpt: "Tudo o que precisas de saber para ligar o Instagram à tua conta Fluxo.",
    category: "Marketing",
    content: "Conteúdo completo sobre Instagram Direct...",
    publishedAt: "2026-07-01T14:00:00",
    status: "publicado",
  },
  {
    id: "post-4",
    title: "Como a Padaria Rosa Dourada triplicou as encomendas",
    excerpt: "Um caso de sucesso real de um cliente Fluxo no plano Pro.",
    category: "Casos de sucesso",
    content: "Conteúdo completo sobre o caso de sucesso...",
    publishedAt: "2026-07-08T11:15:00",
    status: "rascunho",
  },
  {
    id: "post-5",
    title: "Novidades de julho: respostas com IA no plano Pro",
    excerpt: "Conhece as últimas funcionalidades lançadas na plataforma.",
    category: "Produto",
    content: "Conteúdo completo sobre novidades de produto...",
    publishedAt: "2026-07-12T16:45:00",
    status: "rascunho",
  },
];

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
}

export const HELP_CATEGORIES = ["Primeiros passos", "Canais", "Fluxos", "Faturação", "Conta"];

export const HELP_ARTICLES: HelpArticle[] = [
  { id: "help-1", title: "Como criar a tua conta Fluxo", category: "Primeiros passos", content: "Passo a passo de criação de conta...", updatedAt: "2026-05-20T10:00:00" },
  { id: "help-2", title: "Ligar o WhatsApp Business ao Fluxo", category: "Canais", content: "Guia de ligação do WhatsApp...", updatedAt: "2026-06-04T10:00:00" },
  { id: "help-3", title: "Ligar o Instagram ao Fluxo", category: "Canais", content: "Guia de ligação do Instagram...", updatedAt: "2026-06-04T10:00:00" },
  { id: "help-4", title: "Criar o teu primeiro fluxo automatizado", category: "Fluxos", content: "Guia de criação de fluxos...", updatedAt: "2026-06-15T10:00:00" },
  { id: "help-5", title: "Como funciona a faturação mensal", category: "Faturação", content: "Explicação do ciclo de faturação...", updatedAt: "2026-06-22T10:00:00" },
  { id: "help-6", title: "Alterar o plano da tua conta", category: "Conta", content: "Guia de alteração de plano...", updatedAt: "2026-07-01T10:00:00" },
  { id: "help-7", title: "Convidar a tua equipa", category: "Conta", content: "Guia de gestão de equipa...", updatedAt: "2026-07-05T10:00:00" },
];

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQS: Faq[] = [
  { id: "faq-1", question: "Posso mudar de plano a qualquer momento?", answer: "Sim, podes fazer upgrade ou downgrade do teu plano a qualquer momento nas configurações de faturação.", category: "Faturação" },
  { id: "faq-2", question: "O plano gratuito tem limite de tempo?", answer: "Não, o plano gratuito não expira. Está sempre disponível com os limites definidos.", category: "Planos" },
  { id: "faq-3", question: "Quais os canais suportados?", answer: "O Fluxo suporta WhatsApp Business, Instagram Direct e Email.", category: "Canais" },
  { id: "faq-4", question: "Como cancelo a minha subscrição?", answer: "Podes cancelar em qualquer momento nas configurações de faturação, sem taxas de cancelamento.", category: "Faturação" },
  { id: "faq-5", question: "Os meus dados estão seguros?", answer: "Sim, seguimos as melhores práticas de segurança e estamos em conformidade com o RGPD.", category: "Segurança" },
  { id: "faq-6", question: "Posso ter mais do que um utilizador na conta?", answer: "Sim, o plano Empresas inclui acesso multi-utilizador com permissões por equipa.", category: "Conta" },
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  featured: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  { id: "test-1", name: "Ana Ferreira", role: "Proprietária", company: "Padaria Rosa Dourada", quote: "O Fluxo mudou por completo a forma como respondemos aos clientes no WhatsApp.", featured: true },
  { id: "test-2", name: "João Santos", role: "Diretor Clínico", company: "Clínica Vitalis", quote: "Conseguimos reduzir as faltas às consultas em 40% com os lembretes automáticos.", featured: true },
  { id: "test-3", name: "Marta Oliveira", role: "Gerente", company: "Estética Bela Pele", quote: "Simples de configurar e o suporte é excelente.", featured: false },
  { id: "test-4", name: "Pedro Costa", role: "Sócio-gerente", company: "Auto Peças Ribeiro", quote: "O broadcast de promoções trouxe um aumento real nas vendas.", featured: false },
  { id: "test-5", name: "Sofia Rodrigues", role: "Fundadora", company: "Loja Verde Vivo", quote: "Recomendo a qualquer pequeno negócio que queira poupar tempo.", featured: true },
];
