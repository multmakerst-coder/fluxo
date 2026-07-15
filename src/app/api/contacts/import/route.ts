import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BATCH_SIZE = 500;

// Mapeia cabeçalhos comuns (PT/EN) para as colunas da tabela `contacts`
const COLUMN_ALIASES: Record<string, string> = {
  name: "name",
  nome: "name",
  email: "email",
  e_mail: "email",
  phone: "phone",
  telefone: "phone",
  telemovel: "phone",
  notes: "notes",
  notas: "notes",
};

interface ParsedContact {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o formulário" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Ficheiro CSV em falta (campo 'file')" }, { status: 400 });
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);

  if (headers.length === 0) {
    return NextResponse.json({ error: "CSV vazio ou inválido" }, { status: 400 });
  }

  const parsedContacts: ParsedContact[] = [];
  const parseErrors: { line: number; reason: string }[] = [];

  rows.forEach((row, index) => {
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      const column = COLUMN_ALIASES[header];
      if (column && row[i]) record[column] = row[i];
    });

    const name = record.name || record.email || record.phone;
    if (!name) {
      parseErrors.push({ line: index + 2, reason: "Linha sem nome, email ou telefone" });
      return;
    }

    parsedContacts.push({
      name,
      email: record.email || undefined,
      phone: record.phone || undefined,
      notes: record.notes || undefined,
    });
  });

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, owner_id")
      .eq("id", user.id)
      .single();

    const clientId = profile?.owner_id ?? profile?.id ?? user.id;

    let successCount = 0;
    const insertErrors: string[] = [];

    for (let i = 0; i < parsedContacts.length; i += BATCH_SIZE) {
      const batch = parsedContacts.slice(i, i + BATCH_SIZE).map((c) => ({
        client_id: clientId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        notes: c.notes,
        source_channel: null,
      }));

      const { data, error } = await supabase.from("contacts").insert(batch).select("id");

      if (error) {
        insertErrors.push(error.message);
      } else {
        successCount += data?.length ?? 0;
      }
    }

    return NextResponse.json(
      {
        total: rows.length,
        success: successCount,
        errors: parseErrors.length + (parsedContacts.length - successCount),
        parseErrors,
        insertErrors,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao importar contactos:", error);
    return NextResponse.json({ error: "Erro ao importar contactos" }, { status: 500 });
  }
}

/**
 * Parser de CSV simples mas tolerante a campos entre aspas com vírgulas/aspas escapadas.
 * Não suporta todas as particularidades do RFC 4180, mas cobre os casos comuns de exportação.
 */
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}
