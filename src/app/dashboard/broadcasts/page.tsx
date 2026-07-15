import { MessageCircle, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappBroadcastsTab } from "@/components/broadcasts/whatsapp-broadcasts-tab";
import { EmailBroadcastsTab } from "@/components/broadcasts/email-broadcasts-tab";

export default function BroadcastsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Broadcasts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Envia mensagens em massa a segmentos de contactos por WhatsApp ou email.
        </p>
      </div>

      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">
            <MessageCircle />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail />
            Email
          </TabsTrigger>
        </TabsList>
        <TabsContent value="whatsapp">
          <WhatsappBroadcastsTab />
        </TabsContent>
        <TabsContent value="email">
          <EmailBroadcastsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
