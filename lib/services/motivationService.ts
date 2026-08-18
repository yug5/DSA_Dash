/**
 * Returns deterministic encouraging feedback without punitive framing.
 */
export function getDailyMotivationMessage(target: number, completed: number): string {
  if (completed >= target && target > 0) {
    return 'Target complete. Great work. Keep the momentum going.';
  }

  if (target > 0 && completed / target >= 0.8) {
    return 'Almost there. You did great today.';
  }

  if (completed >= 2) {
    return "You didn't reach today's target, but you still showed up. Keep going tomorrow.";
  }

  if (completed === 1) {
    return "You showed up today, and that's a win. Tomorrow is another chance.";
  }

  return "Missed today? It's okay. Don't let one day become a week. Come back tomorrow.";
}
