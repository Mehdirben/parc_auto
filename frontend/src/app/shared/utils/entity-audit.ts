import type { ActivityItem } from '../ui/activity-timeline/activity-timeline.component';
import type { AuditEvent } from '../models/api.models';
import { versElementsTimeline } from './audit-timeline';

const LIBELLES = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  SUPPRESSION: 'Suppression'
} as const;

export function versTimelineAudit(historique: AuditEvent[]): ActivityItem[] {
  return versElementsTimeline(
    historique,
    LIBELLES,
    action => action === 'SUPPRESSION'
      ? 'red'
      : action === 'MODIFICATION' ? 'gold' : 'green'
  );
}
