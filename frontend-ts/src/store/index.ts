import { createStore, Store, useStore as baseUseStore } from 'vuex';
import { InjectionKey } from 'vue';
import * as api from '../services/api';
import type { State, Location, Notification, LocationInput } from '../types';

export const key: InjectionKey<Store<State>> = Symbol();

export default createStore<State>({
  state(): State {
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
    SET_LOCATIONS(state: State, locations: Location[]): void {
      state.locations = locations;
    },
    ADD_LOCATION(state: State, location: Location): void {
      state.locations.unshift(location);
    },
    REMOVE_LOCATION(state: State, id: number): void {
      state.locations = state.locations.filter(l => l.id !== id);
    },
    SET_LOADING(state: State, loading: boolean): void {
      state.loading = loading;
    },
    SET_SELECTED_COORDS(state: State, coords: [number, number] | null): void {
      state.selectedCoords = coords;
    },
    SET_SELECTED_ADDRESS(state: State, address: string | null): void {
      state.selectedAddress = address;
    },
    SET_SELECTED_NAME(state: State, name: string | null): void {
      state.selectedName = name;
    },
    SET_SAVING(state: State, saving: boolean): void {
      state.saving = saving;
    },
    SET_NOTIFICATION(state: State, notification: Notification | null): void {
      state.notification = notification;
    },
    SET_FOCUSED_LOCATION(state: State, location: Location | null): void {
      state.focusedLocation = location;
    },
    SET_SEARCH_KEYWORD(state: State, keyword: string): void {
      state.searchKeyword = keyword;
    }
  },

  actions: {
    async fetchLocations({ commit }): Promise<void> {
      commit('SET_LOADING', true);
      try {
        const locations = await api.getLocations();
        commit('SET_LOCATIONS', locations);
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

    async saveLocation({ commit, state }): Promise<void> {
      if (!state.selectedCoords || !state.selectedAddress || !state.selectedName) return;

      commit('SET_SAVING', true);
      try {
        const locationData: LocationInput = {
          name: state.selectedName,
          address: state.selectedAddress,
          latitude: state.selectedCoords[1],
          longitude: state.selectedCoords[0]
        };
        
        const data = await api.saveLocation(locationData);
        
        const newLocation: Location = {
          id: data.id,
          name: data.name,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString()
        };
        
        commit('ADD_LOCATION', newLocation);
        commit('SET_SELECTED_COORDS', null);
        commit('SET_SELECTED_ADDRESS', null);
        commit('SET_SELECTED_NAME', null);
        
        this.dispatch('showNotification', {
          message: 'Location saved successfully!',
          type: 'success'
        });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Error saving location';
        this.dispatch('showNotification', {
          message,
          type: 'error'
        });
      } finally {
        commit('SET_SAVING', false);
      }
    },

    async deleteLocation({ commit }, id: number): Promise<void> {
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

    async searchLocations({ commit, state }): Promise<void> {
      if (!state.searchKeyword || state.searchKeyword.trim() === '') {
        this.dispatch('fetchLocations');
        return;
      }

      commit('SET_LOADING', true);
      try {
        const locations = await api.searchLocations(state.searchKeyword);
        commit('SET_LOCATIONS', locations);
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

    showNotification({ commit }, notification: Notification): void {
      commit('SET_NOTIFICATION', notification);
      setTimeout(() => {
        commit('SET_NOTIFICATION', null);
      }, 3000);
    },

    setSelectedCoords({ commit }, coords: [number, number] | null): void {
      commit('SET_SELECTED_COORDS', coords);
    },

    setSelectedAddress({ commit }, address: string | null): void {
      commit('SET_SELECTED_ADDRESS', address);
    },

    setSelectedName({ commit }, name: string | null): void {
      commit('SET_SELECTED_NAME', name);
    },

    focusLocation({ commit }, location: Location | null): void {
      commit('SET_FOCUSED_LOCATION', location);
    },

    setSearchKeyword({ commit }, keyword: string): void {
      commit('SET_SEARCH_KEYWORD', keyword);
    }
  },

  getters: {
    locations: (state: State): Location[] => state.locations,
    loading: (state: State): boolean => state.loading,
    selectedCoords: (state: State): [number, number] | null => state.selectedCoords,
    selectedAddress: (state: State): string | null => state.selectedAddress,
    selectedName: (state: State): string | null => state.selectedName,
    saving: (state: State): boolean => state.saving,
    notification: (state: State): Notification | null => state.notification,
    focusedLocation: (state: State): Location | null => state.focusedLocation,
    searchKeyword: (state: State): string => state.searchKeyword
  }
});

export function useStore(): Store<State> {
  return baseUseStore(key);
}
