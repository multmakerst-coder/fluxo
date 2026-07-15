import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogTab } from "./blog-tab";
import { HelpTab } from "./help-tab";
import { FaqsTab } from "./faqs-tab";
import { TestimonialsTab } from "./testimonials-tab";

export default function AdminConteudoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Conteúdo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gere o blog, a central de ajuda, as FAQs e os depoimentos do Fluxo.</p>
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="blog">
            <TabsList>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="ajuda">Central de Ajuda</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
              <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger>
            </TabsList>
            <TabsContent value="blog" className="pt-5">
              <BlogTab />
            </TabsContent>
            <TabsContent value="ajuda" className="pt-5">
              <HelpTab />
            </TabsContent>
            <TabsContent value="faqs" className="pt-5">
              <FaqsTab />
            </TabsContent>
            <TabsContent value="depoimentos" className="pt-5">
              <TestimonialsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
