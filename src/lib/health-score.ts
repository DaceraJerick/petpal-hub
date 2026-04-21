import { differenceInDays, differenceInMonths } from "date-fns";

/**
 * Pet Health Score Algorithm (0-100)
 * - 40 pts: 7-day feeding adherence
 * - 30 pts: Vet visit within last 6 months
 * - 20 pts: All vaccines up-to-date
 * - 10 pts: Active medication compliance
 */
export function calculateHealthScore(data: {
  feedingAdherence7d: number; // 0-1 ratio of meals given vs scheduled
  lastVetVisitDate: string | null;
  vaccines: { nextDue: string | null }[];
  medications: { active: boolean; endDate: string | null }[];
}): number {
  const now = new Date();
  let score = 0;

  // Feeding adherence (40 pts)
  score += Math.round(data.feedingAdherence7d * 40);

  // Vet visit recency (30 pts)
  if (data.lastVetVisitDate) {
    const months = differenceInMonths(now, new Date(data.lastVetVisitDate));
    if (months <= 6) score += 30;
    else if (months <= 12) score += 15;
  }

  // Vaccine status (20 pts)
  if (data.vaccines.length > 0) {
    const upToDate = data.vaccines.filter(v => {
      if (!v.nextDue) return true;
      return new Date(v.nextDue) > now;
    });
    score += Math.round((upToDate.length / data.vaccines.length) * 20);
  } else {
    score += 10; // No vaccines tracked = neutral
  }

  // Medication compliance (10 pts)
  if (data.medications.length > 0) {
    const compliant = data.medications.filter(m => m.active);
    score += Math.round((compliant.length / data.medications.length) * 10);
  } else {
    score += 10; // No meds = healthy
  }

  return Math.min(100, Math.max(0, score));
}

export function getVaccineStatus(nextDue: string | null): "up-to-date" | "due-soon" | "overdue" {
  if (!nextDue) return "up-to-date";
  const now = new Date();
  const due = new Date(nextDue);
  const daysUntilDue = differenceInDays(due, now);
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 30) return "due-soon";
  return "up-to-date";
}
