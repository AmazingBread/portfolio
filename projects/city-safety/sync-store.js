// 실제 store.js에서 사용하는 mutation 이름과 지도 공유 구조를 공개용으로 최소화했습니다.
export const stateMutations = {
  SET_MAP(state, map) {
    state.map = map;
  },
  SET_SHOW_CCTV800(state, value) {
    state.isCctv800Open = value;
  },
  SET_CCTV800_LIST(state, list) {
    state.cctv800List = list;
  },
  SELECT_CCTV(state, id) {
    state.selectedId = id;
  },
};
export function createSyncStore(Vuex) {
  return new Vuex.Store({
    strict: true,
    state: { map: null, isCctv800Open: true, cctv800List: [], selectedId: null },
    mutations: stateMutations,
    actions: {
      selectCctv({ commit }, id) {
        commit('SELECT_CCTV', id);
      },
      toggleCctv800({ commit, state }) {
        commit('SET_SHOW_CCTV800', !state.isCctv800Open);
      },
    },
  });
}
