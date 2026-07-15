import { notFound } from "next/navigation";
import { getContactById } from "../_data";
import { INITIAL_TAGS } from "../_data";
import { ContactProfileClient } from "./contact-profile-client";

export default async function ContactProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = getContactById(id);

  if (!contact) {
    notFound();
  }

  return <ContactProfileClient contact={contact} availableTags={INITIAL_TAGS} />;
}
