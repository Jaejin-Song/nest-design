const lastKeyCompositionStatus: boolean = false;

export function shouldIgnoreKey(evt: KeyboardEvent) {
  return (
    lastKeyCompositionStatus === true ||
    evt !== Object(evt) ||
    evt.isComposing === true
  );
}
