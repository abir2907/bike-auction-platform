import { prisma } from '../config/prisma';
import { logger } from '../config/logger';

interface AuditEntry {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

/**
 * Fire-and-forget security/audit trail. Failures to write an audit row must
 * never break the user-facing request, so we swallow and log errors.
 */
export function audit(entry: AuditEntry): void {
  prisma.auditLog
    .create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata as object | undefined,
        ip: entry.ip,
      },
    })
    .catch((err) => logger.warn({ err }, 'Failed to write audit log'));
}
