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
          :placeholder="selectedName || 'Enter location name'"
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

<script lang="ts">
import { ref, computed, watch, defineComponent } from 'vue';
import { useStore } from '../store';

export default defineComponent({
  name: 'MapOverlay',
  setup() {
    const store = useStore();
    const locationName = ref<string>('');

    const selectedName = computed<string | null>(() => store.getters.selectedName);
    const selectedCoords = computed<[number, number] | null>(() => store.getters.selectedCoords);
    const selectedAddress = computed<string | null>(() => store.getters.selectedAddress);
    const saving = computed<boolean>(() => store.getters.saving);

    const displayAddress = computed<string>(() => {
      if (!selectedAddress.value) {
        return 'Loading...';
      }
      if (selectedAddress.value === 'Unknown location' ||
          selectedAddress.value === 'Address lookup failed') {
        return 'Unknown';
      }
      return selectedAddress.value;
    });

    const canSave = computed<boolean>(() => {
      return !!selectedAddress.value &&
             !!locationName.value &&
             locationName.value.trim().length > 0 &&
             !saving.value;
    });

    const formatCoords = (coords: [number, number]): string => {
      return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
    };

    const updateName = (): void => {
      store.dispatch('setSelectedName', locationName.value);
    };

    const handleSave = (): void => {
      if (canSave.value) {
        store.dispatch('saveLocation');
      }
    };

    // Watch for selection changes and clear name
    watch(selectedCoords, (newCoords: [number, number] | null) => {
      if (!newCoords) {
        locationName.value = '';
      }
    });

    return {
      selectedName,
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
});
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
