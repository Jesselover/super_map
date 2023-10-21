<template>
  <div>
    <div class="tree-wrap">
      <div class="tree-title">{{title}}</div>
      <div class="tree-box"></div>
    </div>
    <div class="map-container"
         id="map-container"></div>
    <div class="maptool-box">
      <div v-for="(item,index) in toolsOption"
           :key="index"
           class="tool-info">
        <img v-if="!item.checked"
             :src="item.icon"
             class="tool-img" />
        <img v-if="item.checked"
             :src="item.checkIcon || item.icon"
             class="tool-img" />
        <el-checkbox-group v-model="checkList">
          <el-checkbox :label="item.name"
                       @change="checked=>checkRow(checked, item, index)">{{item.name}}</el-checkbox>
        </el-checkbox-group>
        <div class="search-mode"
             v-if="item.type == 4"
             :style="{top: (item.type == 4 && item.checked) ? '35px' : '-500px'}">
          <input class="search"
                 type="text"
                 id="search">
          <img src="@/assets/images/close-search.png"
               class="close"
               @click="checkRow(false, item, index)">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import locationIcon from '@/assets/images/Location-fill.png'
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import '@supermap/iclient-leaflet';
// import myData from './myData'
import txj from './txj';
export default {
  name: "LeafletMap",
  components: {},
  data () {
    return {
      // step 页面样式
      title:txj.title,
      toolsOption: txj.toolsOption,
      // step map
      map:null,
      amapLayer:null,
      tdtLayers:[],

      checkList: [],
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
  // created(){
  //   this.toolsOption = txj.toolsOption
  // },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      this.map = L.map('map-container')
      // 加载 open street map 图层服务
      this.amapLayer = L.tileLayer("http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
        attribution: '&copys; 高德地图', //用来进行属性控制的字符串，描述了图层数据
        // maxZoom: 13,
        // minZoom: 3,
        subdomains: "1234", // 子域名，替换{s}
        zoom: 1, // todo
      })
      const tdtImgLayer = L.tileLayer("http://t0.tianditu.gov.cn/img_w/wmts?tk=8c863988b5518ef86f44ffea3b12a4eb", {
        subdomains: "1234", 
      }) // 矢量地图
      const tdtLabelLayer=  L.tileLayer("http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=8c863988b5518ef86f44ffea3b12a4eb", {
        subdomains: "1234", 
      }) // 卫星地图
      const tdtDetailLayer=  L.tileLayer("http://t0.tianditu.gov.cn/cva_w/wmts?tk=8c863988b5518ef86f44ffea3b12a4eb", {
        subdomains: "1234", 
      }) // 矢量助剂
      this.tdtLayers =new L.layerGroup([tdtImgLayer,tdtLabelLayer,tdtDetailLayer]) // todo 
      this.amapLayer.addTo(this.map)
      // 设施地图视图 中心位置
     this.map.setView([34.223, 108.952], 20); //todo

      // 切换地图
      // const layerControl = new L.control.layers({
      //   "高德": amapLayer,
      // })
      // layerControl.addTo(map)

      // marker
      const icon = L.icon({
        iconUrl: locationIcon,
        iconSize: [40, 40],
        iconAnchor: [20, 40], // 指示地理位置的锚点
      })

      const marker = L.marker([34.223, 108.952]
        , { icon })
      marker.addTo(this.map)

      // geoJSON
      const geoLayer = L.geoJSON(this.data, {
        pointToLayer: (geoJsonPoint, lating) => {
          return L.marker(lating, { icon })
        }
      })
      geoLayer.addTo(this.map)

    },
    checkRow (checked, item, index) {
      if (checked) {
        this.toolsOption[index].checked = true;
      } else {
        this.toolsOption[index].checked = false;
        this.checkList = this.checkList.filter((check) => {
          return check != item.name;
        });
      }

      if(item.type==7){
        if(checked){
          this.amapLayer.removeFrom(this.map)
          this.tdtLayers.addTo(this.map)
        } else {
          this.amapLayer.addTo(this.map)
          this.tdtLayers.removeFrom(this.map)
        }

      }
    },

  }
}
</script>

<style>
.map-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.tree-wrap {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 20%;
  height: 100%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 1);
  z-index: 900;
}
.tree-title {
  width: 100%;
  height: 45px;
  line-height: 45px;
  color: #000;
  font-size: 15px;
  padding-left: 10px;
  border-bottom: 1px solid #dedede;
}
.tree-box {
  height: calc(100% - 45px);
  overflow: auto;
}
::v-deep .amap-marker-label {
  border: 0;
  background-color: transparent;
  color: #707070;
}
.map-tool .el-checkbox-group {
  line-height: normal;
}

.amap-sug-result {
  left: auto !important;
  right: 34px;
}

.map-tool .el-checkbox__label {
  padding: 0;
}

.maptool-box {
  z-index: 999;
  cursor: default;
  top: 1%;
  position: absolute;
  right: 1%;
  background-color: rgba(255, 255, 255, 1);
  height: 30px;
  padding: 0 10px;
  display: flex;
  align-items: center;
}
.maptool-box .el-checkbox__input .el-checkbox__inner {
  display: none !important;
}
.tool-info {
  display: inline-block;
  padding: 0 15px;
  /* line-height: 34px; */
  position: relative;
  display: flex;
  align-items: center;
  border-right: 1px dashed #ccc;
}
.maptool-box .tool-info:last-child {
  border-right: none;
}
.tool-info .search-mode {
  width: 200px;
  height: 30px;
  padding: 2px 0;
  background: #fff;
  border: 1px solid #ccc;
  position: absolute;
  top: 35px;
  right: 0;
  display: flex;
  align-items: center;
}
.tool-info .search-mode .search {
  width: 150px;
  border: none;
  outline: none;
  margin: 0 10px;
  border-right: 1px solid #ccc;
}
.tool-info .search-mode .close {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.info-box {
  width: 300px;
  height: 300px;
  background: yellow;
}
.tool-img {
  width: 18px;
  margin-right: 5px;
}
</style>