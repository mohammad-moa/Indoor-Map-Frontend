import type { SurveySession } from '@/types/survey';

export function exportSurveySession(session: SurveySession) {
  const json = JSON.stringify(session, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `survey-${session.id}.json`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}
