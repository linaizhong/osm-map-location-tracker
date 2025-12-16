<template>
  <div id="app">
    <MapView />
    <LocationsList />
    
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import MapView from './components/MapView.vue';
import LocationsList from './components/LocationsList.vue';

export default {
  name: 'App',
  components: {
    MapView,
    LocationsList
  },
  setup() {
    const store = useStore();
    
    const notification = computed(() => store.state.notification);
    
    onMounted(() => {
      store.dispatch('fetchLocations');
    });
    
    return {
      notification
    };
  }
};
</script>