<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import {TiledMapLayer} from '@supermap/iclient-leaflet';
export default {
  name: "SuperMap",
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      var url = "https://iserver.supermap.io/iserver/services/map-world/rest/maps/World";
      var map = L.map('map', {
        crs: L.CRS.EPSG4326,
        center: [0, 0],
        maxZoom: 18,
        zoom: 1
      });
      var layer = new TiledMapLayer(url)
      layer.addTo(map);

    }
  }
}
</script>

<style scoped>
#map {
  margin: 0;
  overflow: hidden;
  background: #fff;
  width: 80%;
  height: 80%;
  position: absolute;
}
</style>
