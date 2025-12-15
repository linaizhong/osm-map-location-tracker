<template>
  <div class="map-overlay" v-if="selectedCoords">
    <h3>Selected Location</h3>
    <div class="selected-location">
      <div class="location-info">
        <label for="location-name"><strong>Name:</strong></label>
        <input
          id="location-name"
          type="text"
          v-model="locationName"
          placeholder="Enter location name"
          class="name-input"
          @input="updateName"
          maxlength="100"
        />
      </div>
      <div class="location-info">
        <strong>Address:</strong> {{ displayAddress }}
      </div>
      <div class="location-info">
        <strong>Coordinates:</strong> {{ formatCoords(selectedCoords) }}
      </div>
    </div>
    <button
      class="btn btn-primary"
      @click="handleSave"
      :disabled="!canSave">
      {{ saving ? 'Saving...' : 'Save Location' }}
    </button>
    <div v-if="!locationName" class="validation-message">
      * Name is required
    </div>
  </div>

  <div class="map-overlay" v-else>
    <h3>Instructions</h3>
    <p>Click anywhere on the map to select a location.</p>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'MapOverlay',
  setup() {
    const store = useStore();
    const locationName = ref('');

    const selectedCoords = computed(() => store.getters.selectedCoords);
    const selectedAddress = computed(() => store.getters.selectedAddress);
    const saving = computed(() => store.getters.saving);

    const displayAddress = computed(() => {
      if (!selectedAddress.value) {
        return 'Loading...';
      }
      if (selectedAddress.value === 'Unknown location' ||
          selectedAddress.value === 'Address lookup failed') {
        return 'Unknown';
      }
      return selectedAddress.value;
    });

    const canSave = computed(() => {
      return selectedAddress.value &&
             locationName.value &&
             locationName.value.trim().length > 0 &&
             !saving.value;
    });

    const formatCoords = (coords) => {
      return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
    };

    const updateName = () => {
      store.dispatch('setSelectedName', locationName.value);
    };

    const handleSave = () => {
      if (canSave.value) {
        store.dispatch('saveLocation');
      }
    };

    // Watch for selection changes and clear name
    watch(selectedCoords, (newCoords) => {
      if (!newCoords) {
        locationName.value = '';
      }
    });

    return {
      selectedCoords,
      selectedAddress,
      saving,
      locationName,
      canSave,
      displayAddress,
      formatCoords,
      handleSave,
      updateName
    };
  }
};
</script>

<style scoped>
.name-input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.name-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.validation-message {
  margin-top: 8px;
  color: #e74c3c;
  font-size: 12px;
  font-style: italic;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>