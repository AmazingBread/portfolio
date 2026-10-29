export function seeded(seed = 91) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
export function makeSeries(count) {
  const random = seeded();
  const points = new Float64Array(count);
  for (let i = 0; i < count; i++)
    points[i] =
      1.1 +
      Math.sin(i / Math.max(1, count / 22)) * 0.13 +
      (random() - 0.5) * 0.04 +
      (i % 7777 === 0 ? 0.35 : 0);
  return points;
}
export function minMaxSample(values, start = 0, end = values.length, buckets = 500) {
  start = Math.max(0, Math.floor(start));
  end = Math.min(values.length, Math.ceil(end));
  const length = end - start;
  if (length <= 0) return [];
  if (length <= buckets * 2)
    return Array.from({ length }, (_, i) => ({ x: start + i, y: values[start + i] }));
  const out = [{ x: start, y: values[start] }];
  for (let bucket = 0; bucket < buckets; bucket++) {
    const a = start + Math.floor((bucket * length) / buckets),
      b = start + Math.floor(((bucket + 1) * length) / buckets);
    let min = a,
      max = a;
    for (let i = a + 1; i < b; i++) {
      if (values[i] < values[min]) min = i;
      if (values[i] > values[max]) max = i;
    }
    for (const index of min < max ? [min, max] : min === max ? [min] : [max, min])
      if (out.at(-1)?.x !== index) out.push({ x: index, y: values[index] });
  }
  if (out.at(-1)?.x !== end - 1) out.push({ x: end - 1, y: values[end - 1] });
  return out;
}
export function makeLocations(count) {
  const random = seeded(501);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: '가상 센서 ' + String(i + 1).padStart(4, '0'),
    lat: 35.12 + random() * 0.1,
    lng: 129.01 + random() * 0.14,
    status: i % 17 === 0 ? '경계' : '안전',
  }));
}
export function moveRange(start, end, delta, total) {
  const size = end - start;
  const next = Math.max(0, Math.min(total - size, start + delta));
  return [next, next + size];
}
