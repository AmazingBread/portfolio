import { makeSeries, minMaxSample } from '../lib/data.js';
let values = new Float64Array();
self.onmessage = ({ data }) => {
  if (data.type === 'init') {
    values = makeSeries(data.count);
    self.postMessage({ type: 'ready', id: data.id });
    return;
  }
  const start = performance.now();
  const points = minMaxSample(values, data.start, data.end, data.buckets);
  self.postMessage({ id: data.id, points, ms: performance.now() - start });
};
