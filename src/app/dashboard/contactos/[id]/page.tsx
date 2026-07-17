import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactProfileClient } from "./contact-profile-client";

export default async function ContactProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select(`
      *,
      contact_tags (
        tag_id
      )
    `)
    .eq("id", id)
    .single();

  if (!contact) {
    notFound();
  }

  const { data: tags } = await supabase.from("tags").select("*");
  const availableTags = tags?.map(t => ({ id: t.id, name: t.name, color: t.color })) || [];

  const formattedContact = {
    id: contact.id,
    name: contact.name,
    email: contact.email || "",
    phone: contact.phone || "",
    channel: contact.source_channel || "whatsapp",
    createdAt: contact.created_at,
    lastContactAt: contact.last_contact_at || contact.created_at,
    tags: contact.contact_tags?.map((ct: any) => ct.tag_id) || [],
    status: "ativo" as const,
    customFields: [],
    notes: [],
    conversation: [],
  };

  return <ContactProfileClient contact={formattedContact} availableTags={availableTags} />;
}
