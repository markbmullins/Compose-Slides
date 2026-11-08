export const ease = [0.22, 1, 0.36, 1] as const;
export const delayFor = (index: number, stagger: number, reduced: boolean) => (reduced ? 0 : index * stagger);
export const monthsBetween = (from: string, to: string) => {
  const a = new Date(from);
  const b = new Date(to);
  return Math.max(0, (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth());
};
export type Common = { className?: string; accent?: string };
