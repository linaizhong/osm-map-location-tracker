import { createStore } from 'vuex';
import * as api from '../services/api';

export default createStore({
  state() {
    return {
      locations: [],
      loading: false,
      selectedCoords: null,
      selectedAddress: null,
      selectedName: null,
      saving: false,
      notification: null,
      focusedLocation: null,
      searchKeyword: ''
    };
  },

  mutations: {
    SET_LOCATIONS(state, locations) {
      state.locations = locations;
    },
    ADD_LOCATION(state, location) {
      state.locations.unshift(location);
    },
    REMOVE_LOCATION(state, id) {
      state.locations = state.locations.filter(l => l.id !== id);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_SELECTED_COORDS(state, coords) {
      state.selectedCoords = coords;
    },
    SET_SELECTED_ADDRESS(state, address) {
      state.selectedAddress = address;
    },
    SET_SELECTED_NAME(state, name) {
      state.selectedName = name;
    },
    SET_SAVING(state, saving) {
      state.saving = saving;
    },
    SET_NOTIFICATION(state, notification) {
      state.notification = notification;
    },
    SET_FOCUSED_LOCATION(state, location) {
      state.focusedLocation = location;
    },
    SET_SEARCH_KEYWORD(state, keyword) {
      state.searchKeyword = keyword;
    }
  },

  actions: {
    async fetchLocations({ commit }) {
      commit('SET_LOADING', true);
      try {
        const data = await api.getLocations();
        commit('SET_LOCATIONS', data.locations);
      } catch (error) {
        console.error(error);
        this.dispatch('showNotification', {
          message: 'Error loading locations',
          type: 'error'
        });
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async saveLocation({ commit, state }) {
      if (!state.selectedCoords || !state.selectedAddress || !state.selectedName) return;

      commit('SET_SAVING', true);
      try {
        const data = await api.saveLocation({
          name: state.selectedName,
          address: state.selectedAddress,
          latitude: state.selectedCoords[1],
          longitude: state.selectedCoords[0]
        });
        commit('ADD_LOCATION', {
          id: data.id,
          name: data.name,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString()
        });
        commit('SET_SELECTED_COORDS', null);
        commit('SET_SELECTED_ADDRESS', null);
        commit('SET_SELECTED_NAME', null);
        this.dispatch('showNotification', {
          message: 'Location saved successfully!',
          type: 'success'
        });
      } catch (error) {
        console.error(error);
        this.dispatch('showNotification', {
          message: error.message || 'Error saving location',
          type: 'error'
        });
      } finally {
        commit('SET_SAVING', false);
      }
    },

    async deleteLocation({ commit }, id) {
      try {
        await api.deleteLocation(id);
        commit('REMOVE_LOCATION', id);
        this.dispatch('showNotification', {
          message: 'Location deleted',
          type: 'success'
        });
      } catch (error) {
        console.error(error);
        this.dispatch('showNotification', {
          message: 'Error deleting location',
          type: 'error'
        });
      }
    },

    async searchLocations({ commit, state }) {
      if (!state.searchKeyword || state.searchKeyword.trim() === '') {
        this.dispatch('fetchLocations');
        return;
      }

      commit('SET_LOADING', true);
      try {
        const data = await api.searchLocations(state.searchKeyword);
        commit('SET_LOCATIONS', data.locations);
      } catch (error) {
        console.error(error);
        this.dispatch('showNotification', {
          message: 'Error searching locations',
          type: 'error'
        });
      } finally {
        commit('SET_LOADING', false);
      }
    },

    showNotification({ commit }, { message, type = 'success' }) {
      commit('SET_NOTIFICATION', { message, type });
      setTimeout(() => {
        commit('SET_NOTIFICATION', null);
      }, 3000);
    },

    setSelectedCoords({ commit }, coords) {
      commit('SET_SELECTED_COORDS', coords);
    },

    setSelectedAddress({ commit }, address) {
      commit('SET_SELECTED_ADDRESS', address);
    },

    setSelectedName({ commit }, name) {
      commit('SET_SELECTED_NAME', name);
    },

    focusLocation({ commit }, location) {
      commit('SET_FOCUSED_LOCATION', location);
    },

    setSearchKeyword({ commit }, keyword) {
      commit('SET_SEARCH_KEYWORD', keyword);
    }
  },

  getters: {
    locations: state => state.locations,
    loading: state => state.loading,
    selectedCoords: state => state.selectedCoords,
    selectedAddress: state => state.selectedAddress,
    selectedName: state => state.selectedName,
    saving: state => state.saving,
    notification: state => state.notification,
    focusedLocation: state => state.focusedLocation,
    searchKeyword: state => state.searchKeyword
  }
});