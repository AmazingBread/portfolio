import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { stateMutations } from '../projects/city-safety/sync-store.js';
test('Vuex mutations keep map, visibility, list and selection in a common state', () => {
  const state = { map: null, isCctv800Open: true, cctv800List: [], selectedId: null };
  const map = { id: 'map' };
  const rows = [
    { id: 1, name: 'CCTV A' },
    { id: 2, name: 'CCTV B' },
  ];
  stateMutations.SET_MAP(state, map);
  stateMutations.SET_CCTV800_LIST(state, rows);
  stateMutations.SELECT_CCTV(state, 2);
  stateMutations.SET_SHOW_CCTV800(state, false);
  assert.equal(state.map, map);
  assert.equal(state.cctv800List.find((row) => row.id === state.selectedId).name, 'CCTV B');
  assert.equal(state.isCctv800Open, false);
  stateMutations.SET_CCTV800_LIST(state, []);
  assert.equal(state.cctv800List.length, 0);
});
test('Published weather snapshot is actual ordered measurement schema, without unrelated fields', () => {
  const data = JSON.parse(
    fs.readFileSync(
      new URL('../projects/asiad-wind/data/measurement-snapshot.json', import.meta.url)
    )
  );
  assert.equal(data.snapshot, true);
  assert(data.items.length > 1000);
  assert.equal(data.timezone, 'Asia/Seoul');
  const keys = ['measureDatetime', 'wd10m', 'wdGust', 'ws10m', 'wsGust'].sort();
  for (const [i, row] of data.items.entries()) {
    assert.deepEqual(Object.keys(row).sort(), keys);
    for (const key of ['wd10m', 'wdGust', 'ws10m', 'wsGust'])
      assert(Number.isFinite(row[key]));
    if (i)
      assert(Date.parse(row.measureDatetime) >= Date.parse(data.items[i - 1].measureDatetime));
  }
  assert.equal(Math.max(...data.items.map((row) => row.ws10m)), 2.5);
  assert.equal(Math.max(...data.items.map((row) => row.wsGust)), 12);
});
test('Published original D3 and map SFCs match their recorded original hashes', () => {
  const entries = JSON.parse(
    fs.readFileSync(new URL('../docs/source-provenance.json', import.meta.url))
  );
  for (const entry of entries.filter((entry) => !entry.file.includes('InlineCctvPlayer'))) {
    const bytes = fs.readFileSync(new URL('../' + entry.file, import.meta.url));
    assert.equal(
      crypto.createHash('sha256').update(bytes).digest('hex'),
      entry.originalSha256,
      entry.file
    );
  }
});
function hlsComponent() {
  const script = fs
    .readFileSync(
      new URL('../projects/city-safety/source/InlineCctvPlayer.js', import.meta.url),
      'utf8'
    )
    .replace('export default component;', 'globalThis.result = component;');
  let delay = null;
  const context = {
    window: { L: {} },
    setTimeout: (fn, ms) => {
      delay = ms;
      return 1;
    },
    clearTimeout() {},
  };
  vm.runInNewContext(script, context);
  return { component: context.result, getDelay: () => delay };
}
test('Original HLS component limits playback to 10 seconds and avoids duplicate playing timers', () => {
  const { component, getDelay } = hlsComponent();
  const ctx = { duration: 10, stopTimer: null, pause() {} };
  component.methods.onPlaying.call(ctx);
  assert.equal(getDelay(), 10000);
  assert.equal(ctx.stopTimer, 1);
  component.methods.onPlaying.call(ctx);
  assert.equal(ctx.stopTimer, 1);
});
test('Original HLS pause stops video and additional network loading without destroying the frame', () => {
  const { component } = hlsComponent();
  let pauses = 0,
    stops = 0;
  const ctx = {
    stopTimer: 1,
    $refs: {
      video: {
        pause() {
          pauses++;
        },
      },
    },
    hls: {
      stopLoad() {
        stops++;
      },
    },
  };
  component.methods.pause.call(ctx);
  assert.equal(pauses, 1);
  assert.equal(stops, 1);
  assert.equal(ctx.paused, true);
  assert.equal(ctx.stopTimer, null);
});
test('Original HLS cleanup destroys resources and releases source', () => {
  const { component } = hlsComponent();
  let destroyed = 0,
    loaded = 0,
    removed = '';
  const ctx = {
    stopTimer: 1,
    hls: {
      destroy() {
        destroyed++;
      },
    },
    $refs: {
      video: {
        pause() {},
        removeAttribute(name) {
          removed = name;
        },
        load() {
          loaded++;
        },
      },
    },
  };
  component.methods.cleanup.call(ctx);
  assert.equal(destroyed, 1);
  assert.equal(ctx.hls, null);
  assert.equal(removed, 'src');
  assert.equal(loaded, 1);
});
