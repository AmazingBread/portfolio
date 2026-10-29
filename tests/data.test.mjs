import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSeries, minMaxSample, makeLocations, moveRange } from '../src/lib/data.js';
import { TimedPlayback } from '../src/lib/timed-playback.js';
test('Min/Max sampling preserves original global extrema and bounds output', () => {
  const data = makeSeries(100000);
  data[501] = -10;
  data[70001] = 100;
  const points = minMaxSample(data, 0, data.length, 400);
  assert(points.length <= 802);
  assert.equal(Math.min(...points.map((p) => p.y)), -10);
  assert.equal(Math.max(...points.map((p) => p.y)), 100);
  assert.equal(points[0].x, 0);
  assert.equal(points.at(-1).x, 99999);
  assert(points.every((p, i) => i === 0 || p.x > points[i - 1].x));
});
test('Sampling a viewport never includes points outside the requested range', () => {
  const data = makeSeries(1000),
    points = minMaxSample(data, 100, 300, 20);
  assert(points.every((p) => p.x >= 100 && p.x < 300));
  assert.deepEqual(minMaxSample(data, 0, 0), []);
});
test('Pan range preserves viewport size at both boundaries', () => {
  assert.deepEqual(moveRange(100, 300, -500, 1000), [0, 200]);
  assert.deepEqual(moveRange(100, 300, 2000, 1000), [800, 1000]);
});
test('Location generation is reproducible and has unique IDs', () => {
  const points = makeLocations(2000);
  assert.equal(new Set(points.map((p) => p.id)).size, 2000);
  assert.deepEqual(points, makeLocations(2000));
  assert(
    points.every((p) => p.lat >= 35.12 && p.lat <= 35.22 && p.lng >= 129.01 && p.lng <= 129.15)
  );
});
test('Playback stops after 10 seconds and replay cancels previous timer', () => {
  let callback,
    ms,
    clears = 0,
    stops = 0;
  const playback = new TimedPlayback({
    onStop: () => stops++,
    setTimer: (fn, delay) => {
      callback = fn;
      ms = delay;
      return 1;
    },
    clearTimer: () => clears++,
  });
  playback.start();
  assert.equal(ms, 10000);
  playback.start();
  assert.equal(clears, 1);
  callback();
  assert.equal(stops, 1);
  assert.equal(playback.timer, null);
  playback.start();
  playback.destroy();
  assert.equal(clears, 2);
});

import { makeWindData, windVector, maxWind } from '../projects/asiad-wind/data.js';
test('Wind vector uses north as zero degrees and east as 90 degrees', () => {
  assert(Math.abs(windVector(1, 0).x) < 1e-10);
  assert.equal(windVector(1, 0).y, -1);
  assert.equal(windVector(1, 90).x, 1);
  assert(Math.abs(windVector(1, 90).y) < 1e-10);
});
test('Wind dataset is ordered, reproducible and maximum keeps matching timestamp', () => {
  const data = makeWindData(7);
  assert.equal(data.length, 1008);
  assert(data.every((row, i) => i === 0 || row.date > data[i - 1].date));
  assert.deepEqual(data, makeWindData(7));
  const peak = maxWind(data, 'gust');
  assert.equal(peak.gust, Math.max(...data.map((d) => d.gust)));
  assert(data.includes(peak));
  assert.equal(maxWind([], 'speed'), null);
});
