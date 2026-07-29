let pending: string | null = null;

/** Queues a question for the Assistant page to auto-send once it mounts. */
export function setPendingQuestion(question: string) {
  pending = question;
}

/** Reads and clears the queued question — one-shot, so it only fires once. */
export function takePendingQuestion(): string | null {
  const q = pending;
  pending = null;
  return q;
}
