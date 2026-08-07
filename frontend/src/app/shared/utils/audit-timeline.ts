import type { ActivityItem } from '../ui/activity-timeline/activity-timeline.component';

export interface EvenementTimeline<Action extends string> {
  action: Action;
  dateEvenement: string;
  utilisateur: string;
}

export function versElementsTimeline<Action extends string>(
  historique: readonly EvenementTimeline<Action>[],
  libelles: Readonly<Record<Action, string>>,
  couleur: (action: Action) => ActivityItem['tone']
): ActivityItem[] {
  return historique.map(événement => ({
    label: libelles[événement.action],
    date: événement.dateEvenement,
    user: événement.utilisateur,
    tone: couleur(événement.action)
  }));
}
