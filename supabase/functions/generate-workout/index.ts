// Edge Function : generate-workout
// Genere une seance de natation structuree (format Block > SubBlock de
// l'app) via l'API Claude, a partir d'un objectif, niveau, duree, bassin.
//
// Deploiement :
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy generate-workout
//
// Invoquee par le client via supabase.functions.invoke('generate-workout', { body })

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

interface GenerateParams {
  objective: string; // 'endurance' | 'sprint' | 'technique' | 'recovery'
  level: string; // 'debutant' | 'intermediaire' | 'avance'
  minutes: number; // duree cible
  poolLength: 25 | 50;
  notes?: string; // contraintes libres (materiel, points a travailler)
}

const WORKOUT_TOOL = {
  name: 'save_workout',
  description: 'Enregistre la seance de natation generee',
  input_schema: {
    type: 'object',
    required: ['title', 'description', 'blocks'],
    properties: {
      title: { type: 'string', description: 'Titre court de la seance en francais' },
      description: { type: 'string', description: '1-2 phrases sur l\'intention de la seance' },
      blocks: {
        type: 'array',
        description: 'Blocs ordonnes : echauffement, corps, recuperation',
        items: {
          type: 'object',
          required: ['type', 'name', 'sub_blocks'],
          properties: {
            type: { type: 'string', enum: ['warmup', 'main', 'cooldown', 'other'] },
            name: { type: 'string' },
            sub_blocks: {
              type: 'array',
              items: {
                type: 'object',
                required: ['distance', 'repetitions'],
                properties: {
                  distance: { type: 'integer', description: 'Distance par repetition en metres, multiple de la longueur du bassin' },
                  repetitions: { type: 'integer', minimum: 1 },
                  description: { type: 'string', description: 'Consigne courte (nage, allure, educatif)' },
                  departure: { type: 'string', description: 'Intervalle de depart optionnel, ex "1\'30"' },
                },
              },
            },
          },
        },
      },
    },
  },
};

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return json({ error: 'ANTHROPIC_API_KEY non configuree' }, 500);
    }

    const params: GenerateParams = await req.json();
    const { objective, level, minutes, poolLength, notes } = params;

    const prompt = `Tu es un entraineur de natation experimente. Genere une seance complete et realiste.

Contraintes :
- Objectif principal : ${objective}
- Niveau du nageur : ${level}
- Duree cible : ~${minutes} minutes dans l'eau
- Bassin de ${poolLength} m (toutes les distances doivent etre des multiples de ${poolLength})
${notes ? `- Notes du nageur : ${notes}` : ''}

Regles :
- Structure classique : echauffement (~20% du volume), corps de seance (~65%), recuperation (~15%)
- Le corps de seance peut contenir plusieurs sous-blocs (series)
- Les descriptions sont courtes et en francais ("crawl souple", "4 nages", "battements planche"...)
- Les intervalles de depart sont adaptes au niveau
- Volume total coherent avec la duree et le niveau (debutant ~1500-2000m/h, intermediaire ~2500-3000m/h, avance ~3500-4500m/h)

Appelle l'outil save_workout avec la seance.`;

    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        tools: [WORKOUT_TOOL],
        tool_choice: { type: 'tool', name: 'save_workout' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: `API Claude: ${res.status}`, detail }, 502);
    }

    const data = await res.json();
    const toolUse = (data.content ?? []).find((c: any) => c.type === 'tool_use');
    if (!toolUse?.input?.blocks) {
      return json({ error: 'Reponse IA invalide' }, 502);
    }

    const workout = toolUse.input;
    // Ids client generes cote app ; on nettoie/valide le minimum
    workout.blocks = workout.blocks
      .filter((b: any) => Array.isArray(b.sub_blocks) && b.sub_blocks.length > 0)
      .map((b: any) => ({
        type: ['warmup', 'main', 'cooldown', 'other'].includes(b.type) ? b.type : 'other',
        name: String(b.name || 'Bloc'),
        sub_blocks: b.sub_blocks.map((sb: any) => ({
          distance: Math.max(poolLength, Math.round(Number(sb.distance) / poolLength) * poolLength),
          repetitions: Math.max(1, Number(sb.repetitions) || 1),
          description: sb.description ? String(sb.description) : undefined,
          departure: sb.departure ? String(sb.departure) : undefined,
        })),
      }));

    return json({
      title: String(workout.title || 'Seance generee'),
      description: String(workout.description || ''),
      blocks: workout.blocks,
    });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
