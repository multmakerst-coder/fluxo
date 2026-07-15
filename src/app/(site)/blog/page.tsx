import type { Metadata } from "next";
import { BlogList } from "./blog-list";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos sobre automação de WhatsApp Business, Instagram Marketing e Email para negócios lusófonos.",
};

export default function BlogPage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute -top-20 -left-24 h-96 w-96 rounded-full bg-white blur-orb" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Blog</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Em breve: dicas, guias e boas práticas sobre automação de WhatsApp, Instagram e Email.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <BlogList />
      </section>
    </>
  );
}
