/**
 * Réplique locale de la base SwimLab (Postgres en mémoire via PGlite).
 *
 * Rejoue le stub Supabase, toutes les migrations de docs/migrations, puis
 * (par défaut) les données démo, puis les fichiers SQL passés en argument.
 * Sert à tester une migration ou une règle de sécurité AVANT de la toucher
 * en production. Rien n'est envoyé à Supabase.
 *
 *   npm run db:replica                         # schéma + démo, vérifie que tout passe
 *   npm run db:replica -- mon_test.sql         # + un fichier SQL de plus
 *   npm run db:replica -- --no-seed            # sans les données démo
 *   npm run db:replica -- --as demo.coach2@example.com --query "select count(*) from workouts"
 *
 * --as exécute la requête comme l'utilisateur donné (rôle authenticated + auth.uid()),
 * donc à travers les règles de sécurité, comme le ferait l'app.
 */
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const args = process.argv.slice(2);

const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return null;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const noSeed = args.includes('--no-seed');
if (noSeed) args.splice(args.indexOf('--no-seed'), 1);
const asEmail = flag('--as');
const query = flag('--query');

const migrationsDir = path.join(root, 'docs/migrations');
const migrations = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => path.join(migrationsDir, f));

const files = [
  path.join(here, 'supabase_stub.sql'),
  ...migrations,
  path.join(here, 'grants.sql'),
  ...(noSeed ? [] : [path.join(root, 'supabase/seed/demo_seed.sql')]),
  ...args.map((f) => path.resolve(f)),
];

const db = await PGlite.create({ extensions: { pgcrypto } });
for (const file of files) {
  try {
    await db.exec(fs.readFileSync(file, 'utf8'));
    console.log('OK    ', path.relative(root, file));
  } catch (err) {
    console.error('ECHEC ', path.relative(root, file), '->', err.message);
    process.exit(1);
  }
}

if (query) {
  if (asEmail) {
    const user = await db.query('select id from auth.users where email = $1', [asEmail]);
    if (!user.rows.length) {
      console.error(`Compte introuvable dans la réplique : ${asEmail}`);
      process.exit(1);
    }
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user.rows[0].id]);
    await db.exec('SET ROLE authenticated');
  }
  try {
    const result = await db.query(query);
    console.log(`\n> ${query}${asEmail ? `   (en tant que ${asEmail})` : ''}`);
    console.table(result.rows);
  } catch (err) {
    console.error(`\nRequête refusée ou en erreur : ${err.message}`);
    process.exit(1);
  }
}
