<template>
  <div id="app">
    <MapView />
    <LocationsList />
    
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, defineComponent } from 'vue';
import { useStore } from './store';
import MapView from './components/MapView.vue';
import LocationsList from './components/LocationsList.vue';
import type { Notification } from './types';

export default defineComponent({
  name: 'App',
  components: {
    MapView,
    LocationsList
  },
  setup() {
    const store = useStore();
    
    const notification = computed<Notification | null>(() => store.state.notification);
    
    onMounted(() => {
      store.dispatch('fetchLocations');
    });
    
    return {
      notification
    };
  }
});
</script>
