export function getInkDropScale(
  age: number,
  growTime: number,
  holdTime: number,
  fadeTime: number,
  maxScale: number,
): number {
  const smoothstep = (value: number) => value * value * (3 - 2 * value);

  if (growTime > 0 && age < growTime) {
    return maxScale * smoothstep(age / growTime);
  }

  const fadeStart = growTime + holdTime;
  if (age < fadeStart) return maxScale;
  if (fadeTime <= 0) return 0;

  return maxScale * (1 - smoothstep(Math.min(1, (age - fadeStart) / fadeTime)));
}
