const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");

function loadEnv(file) {
  const content = fs.readFileSync(file, "utf8");
  const result = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) result[m[1]] = m[2];
  }
  return result;
}

const env = loadEnv(path.join(__dirname, "..", ".env.local"));
const SEED_PASSWORD = "GaiaSeed2026!";

const brands = [
  { name: "Lumina Skin", email: "lumina@luminaskin.com" },
  { name: "Yerba Pampa", email: "hola@yerbapampa.com" },
  { name: "Atelier Norte", email: "hola@ateliernorte.com" },
  { name: "Flexio", email: "hola@flexio.com" },
  { name: "Olivia", email: "hola@olivia.ar" },
  { name: "Núcleo Fit", email: "hola@nucleofit.com" },
];

const campaigns = [
  {
    title: "Rutina de skincare en 20 segundos",
    brand: "Lumina Skin",
    category: "Beauty",
    budget_min: 350,
    budget_max: null,
    description:
      "Buscamos micro-creadores que cuenten su rutina diaria de skincare en un video vertical dinámico. Queremos recomendaciones honestas, estilo 'así lo uso yo', con foco en la piel real y sin exageraciones.",
    deliverables:
      "1 video vertical de 15-30 segundos\n2 historias complementarias\nDerechos de uso por 6 meses",
    deadline: "2026-09-15",
    status: "open",
    tags: ["skincare", "rutina", "piel real", "antes/después"],
  },
  {
    title: "Unboxing de nuestro nuevo mate",
    brand: "Yerba Pampa",
    category: "Food",
    budget_min: 280,
    budget_max: null,
    description:
      "Queremos que abras nuestro nuevo kit de mate frente a cámara. Mostrá el diseño, el aroma y tu primera cebada. Autenticidad total: si algo no te gusta, decilo igual.",
    deliverables:
      "1 video vertical de 30-45 segundos\n1 post en feed con fotos reales\nDerechos de uso por 12 meses",
    deadline: "2026-09-22",
    status: "open",
    tags: ["unboxing", "comida", "mate", "producto real"],
  },
  {
    title: "Outfit de invierno con nuestra línea cápsula",
    brand: "Atelier Norte",
    category: "Fashion",
    budget_min: 420,
    budget_max: null,
    description:
      "Presentamos nuestra línea cápsula de invierno. Buscamos creadores de moda que armen looks versátiles con 3 prendas y los muestren en situaciones reales: la calle, la oficina, un plan nocturno.",
    deliverables:
      "1 reel principal de 30 segundos\n3 fotos de lookbook en alta resolución\n1 historia con el proceso de armado",
    deadline: "2026-09-30",
    status: "open",
    tags: ["moda", "looks", "outfits", "línea cápsula"],
  },
  {
    title: "Tu setup de home office ergonómico",
    brand: "Flexio",
    category: "Tech",
    budget_min: 380,
    budget_max: null,
    description:
      "Que muestres cómo transformaste tu escritorio con nuestros soportes ergonómicos. El foco está en la productividad: antes/después, comodidad y orden visual.",
    deliverables:
      "1 video vertical de 30-45 segundos (antes/después)\nToma b-roll de 15 segundos libre de uso\nDerechos de uso por 6 meses",
    deadline: "2026-09-10",
    status: "open",
    tags: ["tech", "setup", "productividad", "ergonomía"],
  },
  {
    title: "Receta fácil con nuestro aceite de oliva",
    brand: "Olivia",
    category: "Food",
    budget_min: 250,
    budget_max: null,
    description:
      "Una receta simple (pasta, ensalada o tostada) protagonizada por nuestro aceite de oliva extra virgen. Queremos cocina casera, luz natural y cero producción exagerada.",
    deliverables:
      "1 video vertical de 30-60 segundos\n1 foto del plato terminado\nDerechos de uso por 6 meses",
    deadline: "2026-10-05",
    status: "open",
    tags: ["cocina", "recetas", "comida casera", "comida"],
  },
  {
    title: "Entrená en casa: 3 ejercicios con mancuernas",
    brand: "Núcleo Fit",
    category: "Fitness",
    budget_min: 300,
    budget_max: null,
    description:
      "Armá una rutina de 3 ejercicios con mancuernas que se pueda hacer en 15 minutos. Priorizamos creadores fitness que transmitan energía y técnica limpia.",
    deliverables:
      "1 video vertical de 30-45 segundos\n2 historias de proceso\nLicencia de uso por 6 meses",
    deadline: "2026-09-18",
    status: "open",
    tags: ["fitness", "entrenamiento", "mancuernas", "en casa"],
  },
];

const creators = [
  {
    name: "Malena Ríos",
    email: "malena@creadora.com",
    handle: "malenabeauty",
    niche: "Beauty",
    location: "Buenos Aires, AR",
    bio: "Skincare honesto y mínimo. Productos que uso en serio, rutinas reales de 30 días.",
    portfolio_url: "https://linktr.ee/malenabeauty",
    tags: ["skincare", "rutina", "piel real", "beauty"],
  },
  {
    name: "Tomás Vega",
    email: "tomas@creador.com",
    handle: "tomi.gourmet",
    niche: "Food",
    location: "Córdoba, AR",
    bio: "Recetas caseras en menos de 60 segundos. Cocina argentina con productos de barrio.",
    portfolio_url: "https://tiktok.com/@tomi.gourmet",
    tags: ["cocina", "recetas", "comida casera", "comida argentina"],
  },
  {
    name: "Juana Pereyra",
    email: "juana@creadora.com",
    handle: "juanitafit",
    niche: "Fitness",
    location: "Rosario, AR",
    bio: "Entrenamientos en casa sin excusas. 15 minutos, cero materiales caros.",
    portfolio_url: "https://youtube.com/@juanitafit",
    tags: ["fitness", "entrenamiento", "mancuernas", "en casa"],
  },
  {
    name: "Franco Basile",
    email: "franco@creador.com",
    handle: "francotech",
    niche: "Tech",
    location: "Mendoza, AR",
    bio: "Setup, gadgets y productividad. Reviews que no leen scripts de las marcas.",
    portfolio_url: "https://instagram.com/francotech",
    tags: ["tech", "setup", "productividad", "reviews"],
  },
  {
    name: "Sol Fontán",
    email: "sol@creadora.com",
    handle: "selfashion",
    niche: "Fashion",
    location: "Buenos Aires, AR",
    bio: "Moda versátil para el día a día. Looks cápsula y estilo circular.",
    portfolio_url: "https://behance.net/sol-fontan",
    tags: ["moda", "looks", "outfits", "línea cápsula"],
  },
];

// Aplicaciones de ejemplo: [título de campaña, creador, propuesta, estado]
const applications = [
  {
    campaign: "Rutina de skincare en 20 segundos",
    creator: "Malena Ríos",
    pitch:
      "Hola! Soy Malena, hago skincare real hace 4 años. Mi idea: un POV de mi rutina al despertar, producto por producto en 20 segundos, con texto honesto sobre cada textura. Ya tengo métrica de que los videos así me promedian 45K views.",
    status: "pending",
  },
  {
    campaign: "Rutina de skincare en 20 segundos",
    creator: "Sol Fontán",
    pitch:
      "Puedo mostrar la rutina desde el enfoque 'menos es más' que conecta con tu marca: 3 pasos, mi piel en cámara sin filtros. Incluyo 2 historias con antes/después de 30 días.",
    status: "pending",
  },
  {
    campaign: "Unboxing de nuestro nuevo mate",
    creator: "Tomás Vega",
    pitch:
      "Abrir el kit frente a cámara, primera cebada y comparación con mi mate de todos los días. Soy de Córdoba, el mate es sagrado, y mi audiencia ya confía en que no pago por un guion. Puedo además armar un post mostrando el diseño.",
    status: "accepted",
  },
  {
    campaign: "Unboxing de nuestro nuevo mate",
    creator: "Malena Ríos",
    pitch:
      "No hago mate habitualmente pero me encanta la propuesta estética. Podría hacer un unboxing 'cocina con amigas' más casual. Sinceramente, creo que hay creadores más especializados que yo para esto.",
    status: "pending",
  },
  {
    campaign: "Outfit de invierno con nuestra línea cápsula",
    creator: "Sol Fontán",
    pitch:
      "Mi fuerte es el armado de looks con pocas prendas. Propongo 3 looks con tu línea cápsula: oficina, plan nocturno y sábado relajado. Aporto fotos en calle con luz natural y un reel con el proceso de armado.",
    status: "pending",
  },
  {
    campaign: "Outfit de invierno con nuestra línea cápsula",
    creator: "Juana Pereyra",
    pitch:
      "No soy creadora de moda pura, pero sí de 'looks para moverte'. Puedo mostrar la cápsula en un entrenamiento outdoor y un plan post-gym. Si buscan estética fitness, soy buena opción.",
    status: "pending",
  },
  {
    campaign: "Tu setup de home office ergonómico",
    creator: "Franco Basile",
    pitch:
      "Transformé mi escritorio este año: estoy en el mejor momento para un antes/después real con fotos y video. Mi audiencia es de productividad, exactamente tu target. Puedo dejar el producto en uso constante para mostrar comodidad a los 7 días.",
    status: "pending",
  },
  {
    campaign: "Receta fácil con nuestro aceite de oliva",
    creator: "Tomás Vega",
    pitch:
      "Una tostada de pan de masa madre, tomate ahumado y un chorro generoso de tu oliva. Cero producción, luz de ventana, ruido de cocina real. Este formato ya me dio un video con 120K reproducciones.",
    status: "accepted",
  },
  {
    campaign: "Receta fácil con nuestro aceite de oliva",
    creator: "Franco Basile",
    pitch:
      "Puedo hacer una receta tonta y rápida estilo 'el que no cocina', con el aceite como protagonista. Más humor que gourmet, si les sirve ese tono.",
    status: "pending",
  },
  {
    campaign: "Entrená en casa: 3 ejercicios con mancuernas",
    creator: "Juana Pereyra",
    pitch:
      "Mi formato estrella: '15 minutos, 3 ejercicios, uno que nadie conoce'. Enseño técnica limpia y una variante para principiantes. Incluyo las 2 historias de proceso y una toma b-roll de las mancuernas en uso.",
    status: "pending",
  },
];

async function upsertUser(db, { email, name, role }) {
  const { rows } = await db.query(`select id from auth.users where email = $1`, [email]);
  let userId = rows[0]?.id;

  if (!userId) {
    const passwordHash = bcrypt.hashSync(SEED_PASSWORD, 10);
    const salt = "$0$" + Buffer.from("supabasetest").toString("base64");
    const res = await db.query(
      `insert into auth.users (
         instance_id, id, aud, role, email,
         encrypted_password, email_confirmed_at, confirmation_sent_at,
         confirmation_token, recovery_token, email_change, email_change_token_new,
         email_change_token_current, email_change_confirm_status,
         reauthentication_token, raw_app_meta_data, raw_user_meta_data,
         is_super_admin, is_sso_user, is_anonymous, created_at, updated_at
       ) values (
         '00000000-0000-0000-0000-000000000000',
         gen_random_uuid(), 'authenticated', 'authenticated', $1,
         $2, now(), now(),
         '', '', '', '', '', 0,
         '', '{"provider":"email","providers":["email"]}',
         $3::jsonb,
         null, false, false, now(), now()
       )
       returning id`,
      [email, passwordHash, JSON.stringify({ role, full_name: name })]
    );
    userId = res.rows[0].id;
  }

  return userId;
}

async function syncProfile(db, userId, { role, name, handle, niche, location, bio, portfolio_url, tags }) {
  await db.query(
    `insert into public.profiles (id, role, full_name, handle, niche, location, bio, portfolio_url, tags)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (id) do update set
         full_name = excluded.full_name,
         handle = coalesce(excluded.handle, profiles.handle),
         niche = coalesce(excluded.niche, profiles.niche),
         location = coalesce(excluded.location, profiles.location),
         bio = coalesce(excluded.bio, profiles.bio),
         portfolio_url = coalesce(excluded.portfolio_url, profiles.portfolio_url),
         tags = coalesce(excluded.tags, profiles.tags)`,
    [userId, role, name, handle ?? null, niche ?? null, location ?? null, bio ?? null, portfolio_url ?? null, tags ?? []]
  );
}

async function main() {
  const db = new Client({
    host: "db.vksggcqinwghgvxglkai.supabase.co",
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();

  const ids = {};

  for (const brand of brands) {
    ids[brand.name] = await upsertUser(db, { ...brand, role: "brand" });
  }
  for (const brand of brands) {
    await syncProfile(db, ids[brand.name], { role: "brand", name: brand.name });
    console.log(`OK usuario: ${brand.name}`);
  }

  for (const creator of creators) {
    ids[creator.name] = await upsertUser(db, { email: creator.email, name: creator.name, role: "creator" });
    await syncProfile(db, ids[creator.name], { role: "creator", name: creator.name, ...creator });
    console.log(`OK usuario: ${creator.name}`);
  }

  const { rows: campaignCountRows } = await db.query(
    `select count(*)::int as n from public.campaigns`
  );
  const count = campaignCountRows[0].n;
  if (count === 0) {
    for (const campaign of campaigns) {
      await db.query(
        `insert into public.campaigns
           (brand_id, title, description, category, budget_min, budget_max, deliverables, deadline, status, tags)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          ids[campaign.brand],
          campaign.title,
          campaign.description,
          campaign.category,
          campaign.budget_min,
          campaign.budget_max,
          campaign.deliverables,
          campaign.deadline,
          campaign.status,
          campaign.tags ?? [],
        ]
      );
      console.log(`OK campaña: ${campaign.title}`);
    }
  } else {
    console.log(`Ya hay ${count} campañas. No inserto para evitar duplicados.`);
  }

  const { rows: campaignRows } = await db.query(
    `select id, title from public.campaigns`
  );
  const campaignIdByTitle = Object.fromEntries(
    campaignRows.map((r) => [r.title, r.id])
  );

  const { rows: appCountRows } = await db.query(
    `select count(*)::int as n from public.applications`
  );
  const appCount = appCountRows[0].n;
  if (appCount === 0) {
    for (const app of applications) {
      const campaignId = campaignIdByTitle[app.campaign];
      if (!campaignId) {
        console.log(`AVISO: no existe la campaña "${app.campaign}", salteo`);
        continue;
      }
      await db.query(
        `insert into public.applications (campaign_id, creator_id, pitch, status)
         values ($1, $2, $3, $4)
         on conflict (campaign_id, creator_id) do nothing`,
        [campaignId, ids[app.creator], app.pitch, app.status]
      );
      console.log(`OK aplicación: ${app.creator} → ${app.campaign}`);
    }
  } else {
    console.log(`Ya hay ${appCount} aplicaciones. No inserto para evitar duplicados.`);
  }

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});