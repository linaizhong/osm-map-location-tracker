<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>Saved Locations</h2>
      <div class="location-count">{{ locations.length }} location(s) saved</div>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <input
        type="text"
        v-model="searchInput"
        @input="handleSearch"
        placeholder="Search by name..."
        class="search-input"
      />
      <button
        v-if="searchInput"
        @click="clearSearch"
        class="clear-search-btn"
        title="Clear search">
        ✕
      </button>
    </div>

    <div class="locations-list">
      <div v-if="loading" class="loading">Loading locations...</div>

      <div v-else-if="locations.length === 0 && !searchInput" class="empty-state">
        <div class="empty-state-icon">📍</div>
        <p>No locations saved yet.</p>
        <p>Click on the map to save your first location!</p>
      </div>

      <div v-else-if="locations.length === 0 && searchInput" class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>No locations found for "{{ searchInput }}"</p>
        <button @click="clearSearch" class="btn btn-secondary">Clear Search</button>
      </div>

      <div v-else>
        <div
          v-for="location in locations"
          :key="location.id"
          class="location-item"
          @click="focusOnMap(location)">
          <div class="location-header">
            <div class="location-name">{{ location.name }}</div>
            <button
              class="btn btn-delete"
              @click.stop="handleDelete(location.id)">
              Delete
            </button>
          </div>
          <div class="location-address">{{ location.address }}</div>
          <div class="location-details">
            Lat: {{ location.latitude.toFixed(6) }},
            Lon: {{ location.longitude.toFixed(6) }}
          </div>
          <div class="location-timestamp">
            {{ formatDate(location.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'LocationsList',
  setup() {
    const store = useStore();
    const searchInput = ref('');
    let searchTimeout = null;

    const locations = computed(() => store.getters.locations);
    const loading = computed(() => store.getters.loading);

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    const handleDelete = (id) => {
      if (confirm('Are you sure you want to delete this location?')) {
        store.dispatch('deleteLocation', id);
      }
    };

    const focusOnMap = (location) => {
      store.dispatch('focusLocation', location);
    };

    const handleSearch = () => {
      // Debounce search to avoid too many API calls
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(() => {
        store.dispatch('setSearchKeyword', searchInput.value);
        store.dispatch('searchLocations');
      }, 300); // Wait 300ms after user stops typing
    };

    const clearSearch = () => {
      searchInput.value = '';
      store.dispatch('setSearchKeyword', '');
      store.dispatch('fetchLocations');
    };

    return {
      locations,
      loading,
      searchInput,
      formatDate,
      handleDelete,
      focusOnMap,
      handleSearch,
      clearSearch
    };
  }
};
</script>

<style scoped>
.search-container {
  position: relative;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.search-input {
  width: 100%;
  padding: 10px 35px 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.search-input::placeholder {
  color: #95a5a6;
}

.clear-search-btn {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: color 0.3s;
}

.clear-search-btn:hover {
  color: #e74c3c;
}

.location-name {
  font-weight: 700;
  color: #2c3e50;
  font-size: 15px;
  margin-bottom: 5px;
  flex: 1;
  word-break: break-word;
}

.location-address {
  font-size: 13px;
  color: #34495e;
  margin-bottom: 5px;
  line-height: 1.4;
  word-break: break-word;
}

.btn-secondary {
  margin-top: 15px;
  background: #95a5a6;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background: #7f8c8d;
}
</style>