<template>
  <div>
    <div class="map-container"
         id="map-container"></div>
    <div class="panel">
    </div>
  </div>
</template>

<script>
import locationIcon from '../assets/images/Location-fill.png'
import "leaflet/dist/leaflet.css"
import L, { geoJson } from "leaflet";
export default {
  name: "LeafletMap",
  components: {},
  data () {
    return {
      data: {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "name": 111
            },
            "geometry": {
              "coordinates": [
                108.80211210733694,
                34.29944059025469
              ],
              "type": "Point"
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": 222
            },
            "geometry": {
              "coordinates": [
                108.7814178540051,
                34.36779515040472
              ],
              "type": "Point"
            },
            "id": 1
          },
          {
            "type": "Feature",
            "properties": {
              "name": 333
            },
            "geometry": {
              "coordinates": [
                108.6345871994074,
                34.362101064700184
              ],
              "type": "Point"
            }
          }
        ]
      }// 切换地图
    }
  },
  
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      const map = L.map('map-container')
      // 加载 open street map 图层服务
      const amapLayer = L.tileLayer("http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
        attribution: '&copys; 高德地图', //用来进行属性控制的字符串，描述了图层数据
        maxZoom: 13,
        minZoom: 3,
        subdomains: "1234", // 子域名，替换{s}
        zoom: 3, // todo
      })
      amapLayer.addTo(map)
      // amapLayer.removeFrom(map) // 移除地图
      // 设施地图视图 中心位置
      map.setView([34.223, 108.952], 13); //todo

      // 切换地图
      const layerControl = new L.control.layers({
        "高德": amapLayer,
      })
      layerControl.addTo(map)

      // marker
      const icon = L.icon({
        iconUrl: locationIcon,
        iconSize: [40, 40],
        iconAnchor: [20, 40], // 指示地理位置的锚点
      })

      const marker = L.marker([34.223, 108.952]
        , { icon })
      marker.addTo(map)

      // geoJSON
      const geoLayer = L.geoJSON(this.data, {
        pointToLayer: (geoJsonPoint, lating) => {
          return L.marker(lating,{ icon })
        }
      })
      geoLayer.addTo(map)

    }
  }
}
</script>

<style>
.map-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 80%;
  height: 80%;
}
</style>