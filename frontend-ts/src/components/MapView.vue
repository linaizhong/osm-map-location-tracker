<template>
  <div class="map-container">
    <div id="map" ref="mapElement"></div>
    <MapOverlay />
  </div>
</template>

<script lang="ts">
import { ref, onMounted, watch, defineComponent } from 'vue';
import { useStore } from '../store';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import MapOverlay from './MapOverlay.vue';
import * as api from '../services/api';
import type { Location } from '../types';

export default defineComponent({
  name: 'MapView',
  components: {
    MapOverlay
  },
  setup() {
    const store = useStore();
    const mapElement = ref<HTMLDivElement | null>(null);
    const mapInstance = ref<Map | null>(null);
    const vectorSource = ref<VectorSource | null>(null);

    // Create red flag SVG
    const flagSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <line x1="8" y1="4" x2="8" y2="30" stroke="#333" stroke-width="1.5"/>
        <path d="M 8 4 L 8 16 L 24 12 L 8 8 Z" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>
      </svg>
    `;

    onMounted(() => {
      if (!mapElement.value) return;

      // Vector source for marker
      vectorSource.value = new VectorSource();

      // Vector layer with red flag icon
      const vectorLayer = new VectorLayer({
        source: vectorSource.value,
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            scale: 1.6,
            src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flagSvg)
          })
        })
      });

      // Initialize map centered on Sydney, Australia
      mapInstance.value = new Map({
        target: mapElement.value,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        view: new View({
          center: fromLonLat([151.2093, -33.8688]), // Sydney coordinates [longitude, latitude]
          zoom: 12 // Zoom level: 12 shows city-level detail
        })
      });

      // Handle map clicks
      mapInstance.value.on('click', async (evt: MapBrowserEvent<UIEvent>) => {
        const coords = toLonLat(evt.coordinate) as [number, number];

        store.dispatch('setSelectedCoords', coords);
        store.dispatch('setSelectedAddress', null);
        store.dispatch('setSelectedName', '');

        // Add marker
        if (vectorSource.value) {
          vectorSource.value.clear();
          const marker = new Feature({
            geometry: new Point(evt.coordinate)
          });
          vectorSource.value.addFeature(marker);
        }

        // Reverse geocode
        const address = await api.reverseGeocode(coords);
        store.dispatch('setSelectedAddress', address);
      });
    });

    // Watch for focusedLocation changes from the store
    watch(
      () => store.state.focusedLocation,
      (location: Location | null) => {
        if (location && mapInstance.value && vectorSource.value) {
          // Convert coordinates to map projection
          const coords: Coordinate = fromLonLat([location.longitude, location.latitude]);

          // Center map on the location
          mapInstance.value.getView().animate({
            center: coords,
            zoom: 15,
            duration: 1000
          });

          // Clear previous markers and add new marker
          vectorSource.value.clear();
          const marker = new Feature({
            geometry: new Point(coords)
          });
          vectorSource.value.addFeature(marker);

          // Update selected location in store
          store.dispatch('setSelectedName', location.name);
          store.dispatch('setSelectedCoords', [location.longitude, location.latitude]);
          store.dispatch('setSelectedAddress', location.address);
        }
      }
    );

    return {
      mapElement
    };
  }
});
</script>
