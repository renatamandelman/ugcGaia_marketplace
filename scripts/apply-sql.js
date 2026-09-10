// ============================================
// GaiaUGC — Aplica los SQLs de supabase/ a la base
// Uso:  node scripts/apply-sql.js
// Requiere: DB_PASSWORD (la de tu Supabase postgres)
// ============================================
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// ---------- ENV ----------
function loadEnv(file) {
  const content = fs.readFileSync(file, "utf8");
  const result = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) result[m[1]] = m[2];
  }
  return result;
}

const env = { ...loadEnv(path.join(__dirname, "..", ".env.local")), ...process.env };
const DB_PASSWORD = env.DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error(
    "❌ Falta DB_PASSWORD. Exportala así:  DB_PASSWORD='tu-clave' node scripts/apply-sql.js"
  );
  process.exit(1);
}

// ---------- CONEXIÓN (igual que seed.js) ----------
const db = new Client({
  host: "db.vksggcqinwghgvxglkai.supabase.co",
  port: 5432,
  user: "postgres",
  password: DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

// ---------- UTILIDADES ----------
const FILES = [
  { file: "schema.sql", label: "Schema base (tablas + RLS)" },
  { file: "brand-fields.sql", label: "Campos de marca (industry + website)" },
  { file: "portfolio.sql", label: "Portfolio items" },
  { file: "media-storage.sql", label: "Bucket media + banners" },
  { file: "social-links.sql", label: "Links de redes" },
];

// Códigos de error de Postgres que significan "ya existe" → no es fatal
const OK_ALREADY_EXISTS = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (policy)
  "42701", // duplicate_column
]);

function splitStatements(sql) {
  // Separa por ';' que estén FUERA de bloques $$ ... $$ (funciones plpgsql)
  // e ignora comentarios '--' hasta fin de línea.
  const statements = [];
  let current = "";
  let inDollar = false;

  const lines = sql.split("\n");
  for (const line of lines) {
    const clean = line.replace(/--.*$/, "").trim();

    // Detectar apertura/cierre de bloque $$ (por linea, suficiente para nuestro SQL)
    const dollarMatches = clean.match(/\$\$+/g);
    if (dollarMatches) {
      const opens = dollarMatches.length;
      if (!inDollar && opens % 2 === 1) inDollar = true;
      else if (inDollar && opens % 2 === 1) inDollar = false;
      // opens % 2 === 0 dentro/afuera no cambia el estado
    }

    const endsWithSemicolon = clean.endsWith(";");
    current += clean + "\n";

    if (endsWithSemicolon && !inDollar) {
      const stmt = current.trim();
      if (stmt && !stmt.endsWith(";")) {
        // no debería pasar, pero por si el ';' quedó separado
      }
      if (stmt) statements.push(stmt);
      current = "";
    }
  }

  const last = current.trim();
  if (last) statements.push(last);
  return statements;
}

async function run() {
  await db.connect();
  console.log("✅ Conectado a la base\n");

  for (const { file, label } of FILES) {
    const abs = path.join(__dirname, "..", "supabase", file);
    if (!fs.existsSync(abs)) {
      console.log(`⚠️  No existe ${file} — lo salteo`);
      continue;
    }

    console.log(`\n▶ ${file}  (${label})`);
    const sql = fs.readFileSync(abs, "utf8");
    const statements = splitStatements(sql);

    let applied = 0;
    let skipped = 0;

    for (const stmt of statements) {
      try {
        await db.query(stmt);
        applied++;
      } catch (err) {
        if (OK_ALREADY_EXISTS.has(err.code)) {
          skipped++;
        } else {
          console.log(`  ❌ ${err.message.split("\n")[0]}`);
          console.log(`     SQL: ${stmt.slice(0, 80)}...\n`);
        }
      }
    }

    console.log(
      `  ✓ ${applied} aplicado${applied !== 1 ? "s" : ""}, ` +
        `${skipped} ya existía${skipped !== 1 ? "n" : ""}${
          applied + skipped < statements.length ? `, ${statements.length - applied - skipped} con error` : ""
        }`
    );
  }

  await db.end();
  console.log("\n✅ ¡Listo! Verificá arriba que no haya ❌");
}

run().catch((err) => {
  console.error("💥 Error de conexión:", err.message);
  process.exit(1);
});