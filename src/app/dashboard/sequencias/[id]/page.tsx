import { getSequencia } from "@/app/dashboard/sequencias/_data";
import { SequenceEditor } from "@/components/sequencias/sequence-editor";

export default async function SequenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sequencia = getSequencia(id);

  return <SequenceEditor sequenciaInicial={sequencia} />;
}
