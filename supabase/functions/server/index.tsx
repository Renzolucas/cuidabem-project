import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Enhanced CORS middleware
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowHeaders: ["Content-Type", "Authorization", "x-client-info", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.use("*", async (c, next) => {
  console.log(`Incoming request: ${c.req.method} ${c.req.url}`);
  await next();
});

// Explicit OPTIONS handler
app.options("*", (c) => {
  return c.text("", 204);
});

// Error handling
app.onError((err, c) => {
  console.error("Hono error:", err);
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

// Health check
app.get("/make-server-0d9b2cf8/health", (c) => {
  return c.json({ status: "ok" });
});

// ─── AUTH: Sign Up ───────────────────────────────────────────────
app.post("/make-server-0d9b2cf8/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: "Campos obrigatórios: email, password, name" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error.message);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (err) {
    console.log("Signup unexpected error:", err);
    return c.json({ error: "Erro interno no servidor ao criar usuário" }, 500);
  }
});

// ─── ANALYZE MEDICINE PHOTO WITH GEMINI ──────────────────────────
app.post("/make-server-0d9b2cf8/analyze-medicine", async (c) => {
  try {
    // Validate auth token
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Token de autenticação necessário" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.log("Auth error in analyze-medicine:", authError?.message);
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { imageBase64, mimeType = "image/jpeg" } = await c.req.json();
    if (!imageBase64) {
      return c.json({ error: "imageBase64 é obrigatório" }, 400);
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return c.json({ error: "GEMINI_API_KEY não configurada no servidor" }, 500);
    }

    const prompt = `Analise esta imagem de um medicamento e extraia as seguintes informações em formato JSON. Se alguma informação não estiver visível, não inclua o campo. Retorne APENAS o JSON sem markdown, backticks ou explicações.

Campos a extrair:
- name: nome do medicamento
- dosage: dosagem (ex: 500mg, 10mg/ml)
- type: tipo do medicamento - deve ser exatamente um destes valores: "Comprimido", "Cápsula", "Xarope", "Gotas", "Injeção", "Pomada", "Spray", "Outro"
- manufacturer: nome do fabricante/laboratório
- description: para que serve o medicamento (indicações terapêuticas)
- sideEffects: principais efeitos colaterais mencionados

Exemplo de resposta:
{"name":"Paracetamol","dosage":"500mg","type":"Comprimido","manufacturer":"EMS","description":"Analgésico e antitérmico","sideEffects":"Náuseas, tontura"}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.log("Gemini API error:", geminiResponse.status, errBody);
      return c.json({ error: `Erro na API Gemini: ${geminiResponse.status} - ${errBody}` }, 502);
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const result = JSON.parse(cleaned);
      return c.json({ result });
    } catch {
      console.log("Failed to parse Gemini response:", text);
      return c.json({ error: "Não foi possível interpretar a resposta da IA. Tente com uma imagem mais nítida.", raw: text }, 422);
    }
  } catch (err) {
    console.log("Analyze medicine unexpected error:", err);
    return c.json({ error: "Erro interno ao analisar imagem" }, 500);
  }
});

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    return await app.fetch(req);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
