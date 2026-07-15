import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const { error } = await supabase.from("broadcasts").delete().eq("id", id);

  if (error) {
    console.error("Erro ao eliminar broadcast:", error);
    return NextResponse.json({ error: "Erro ao eliminar broadcast" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
