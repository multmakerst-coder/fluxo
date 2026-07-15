import { FlowEditor } from "@/components/flow-editor/flow-editor";

export default async function FluxoWhatsappPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FlowEditor flowId={id} channel="whatsapp" />;
}
