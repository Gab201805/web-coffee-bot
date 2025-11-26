import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "app", "data", "products.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return new Response(raw, { status: 200, headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Catalog not found" }), { status: 500 });
  }
}
