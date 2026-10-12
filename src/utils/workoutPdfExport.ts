import { Workout, WorkoutContent, WorkoutBlock, SubBlock } from '../types/database.types';

const BLOCK_TYPE_COLORS: Record<string, string> = {
  warmup: '#10B981',
  main: '#06B6D4',
  cooldown: '#8B5CF6',
  other: '#6B7280',
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  warmup: 'Échauffement',
  main: 'Corps de séance',
  cooldown: 'Récupération',
  other: 'Autre',
};

function formatSubBlock(sub: SubBlock): string {
  const total = sub.distance * sub.repetitions;
  let line = `${sub.distance}m x ${sub.repetitions}`;
  if (sub.description) line += ` — ${sub.description}`;
  if (sub.departure) line += ` — Dep: ${sub.departure}`;
  line += ` <span style="color:#6B7280">(${total}m)</span>`;
  return line;
}

function formatBlock(block: WorkoutBlock): string {
  const color = BLOCK_TYPE_COLORS[block.type] || '#6B7280';
  const label = BLOCK_TYPE_LABELS[block.type] || block.type;
  const blockDistance = block.sub_blocks.reduce(
    (sum, sub) => sum + sub.distance * sub.repetitions,
    0,
  );

  const subBlocksHtml = block.sub_blocks
    .map(
      (sub) =>
        `<tr>
          <td style="padding:4px 8px;border-bottom:1px solid #F3F4F6">${formatSubBlock(sub)}</td>
        </tr>`,
    )
    .join('');

  return `
    <div style="margin-bottom:16px;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden">
      <div style="background:${color};color:white;padding:8px 12px;display:flex;justify-content:space-between">
        <strong>${block.name || label}</strong>
        <span>${blockDistance}m</span>
      </div>
      <table style="width:100%;border-collapse:collapse">
        ${subBlocksHtml}
      </table>
    </div>
  `;
}

/** Generate HTML for a workout (used by expo-print) */
export function generateWorkoutHtml(workout: Workout): string {
  const content = workout.content as WorkoutContent;
  const blocks = content?.blocks || [];

  const blocksHtml = blocks.map(formatBlock).join('');
  const date = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; padding: 24px; color: #1F2937; }
        h1 { font-size: 24px; margin-bottom: 4px; color: #0891b2; }
        .meta { color: #6B7280; margin-bottom: 20px; font-size: 14px; }
        .total { background: #F0FDFA; border: 1px solid #06B6D4; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 20px; }
        .total strong { font-size: 20px; color: #0891b2; }
        .footer { margin-top: 32px; text-align: center; color: #9CA3AF; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${workout.title}</h1>
      ${workout.description ? `<p style="color:#6B7280">${workout.description}</p>` : ''}
      <div class="meta">Exporté le ${date}</div>

      <div class="total">
        Distance totale : <strong>${workout.total_distance || 0}m</strong>
        ${workout.estimated_duration ? ` — Durée estimée : ${workout.estimated_duration} min` : ''}
      </div>

      ${blocksHtml}

      <div class="footer">
        Généré par SwimLab
      </div>
    </body>
    </html>
  `;
}

/** Export workout as PDF and share */
export async function exportWorkoutPdf(workout: Workout): Promise<void> {
  let Print: any;
  let Sharing: any;

  try {
    Print = require('expo-print');
    Sharing = require('expo-sharing');
  } catch {
    throw new Error('Les modules expo-print et expo-sharing sont nécessaires pour l\'export PDF');
  }

  const html = generateWorkoutHtml(workout);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Entraînement - ${workout.title}`,
    UTI: 'com.adobe.pdf',
  });
}
