<template>
  <div>
    <div class="tree-wrap">
      <div class="tree-title">{{title}}</div>
      <div class="tree-box">
        <!-- todo -->
        <el-button @click="searchTruck">选择车辆</el-button>
      </div>
    </div>
    <div class="map-container"
         id="map-container"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import { } from '@supermap/iclient-leaflet'; // 只支持按需引入
// 引入 leaflet.markercluster
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster";
import myData from './txj';
export default {
  name: "LeafletMap",
  components: {},
  data () {
    return {
      // step 页面样式

      title: myData.title,
      // toolsOption: myData.toolsOption,
      // step map
      map: null,
      amapLayer: null,
      // stationsLayer: null,
      // fencesLayer: null,
      tdtLayers: [],
      truckLayer: null,
      checkList: [],
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      this.map = L.map('map-container', {
        center: [34.223, 108.952],
        zoom: 10,
      });
      // 加载 open street map 图层服务
      this.amapLayer = L.tileLayer("http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
        attribution: '&copys; 高德地图', //用来进行属性控制的字符串，描述了图层数据
        maxZoom: 18, //map 对象中的 maxZoom 属性是必须的，否则在创建 **makerClusterGroup ** 会报错
        minZoom: 3,
        subdomains: "1234", // 子域名，替换{s}
        zoom: 1, // todo
      })
      const tdtImgLayer = L.tileLayer("http://t0.tianditu.gov.cn/cta_c/wmts?tk=8c863988b5518ef86f44ffea3b12a4eb", {
        subdomains: "1234",
      }) // 矢量地图 //!401
      const tdtLabelLayer = L.tileLayer("http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=8c863988b5518ef86f44ffea3b12a4eb", {
        subdomains: "1234",
      }) // 卫星地图
      const tdtDetailLayer = L.tileLayer("http://t0.tianditu.gov.cn/cva_w/wmts?tk=8c863988b5518ef86f44ffea3b12a4eb", {
        subdomains: "1234",
      }) // 矢量助记 //!401
      this.tdtLayers = new L.layerGroup([tdtImgLayer, tdtLabelLayer, tdtDetailLayer])
      this.amapLayer.addTo(this.map)
      // 添加天地图图层
      // todo
      // 设施地图视图 中心位置
      this.map.setView([34.32311279131243, 108.79796727472097], 10); //todo
      // step other     
      // 切换地图
      // const layerControl = new L.control.layers({
      //   "高德": amapLayer,
      // })
      // layerControl.addTo(map)
    },
    // 选择车辆
    searchTruck () {
      this.truckLayer = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        disableClusteringAtZoom: 17, //缩放到此级别，将不再聚集
      })
      // const icon = L.icon({
      //   iconUrl: TruckIcon,
      //   iconSize: [30, 30],
      //   // iconAnchor: [30, 30], // 指示地理位置的锚点
      // })
      const data = myData.truckData.data.data
      data.forEach(item => {
        // todo markerImg
        // onLineBus: 1, //1 在线 2 离线
        let markerImg = require('/src/assets/images/offline.png')
        if (item.onLineBus == 1) {
          markerImg = require('/src/assets/images/online.png')
        }
        if (item.onLineBus == 2) {
          markerImg = require('/src/assets/images/offline.png')
        }
        let videoImg = require('/src/assets/images/video1.png')

        const icon = L.divIcon({
          html: `
           <div style=' width: 55px;height: 80px;'>
            <img src=${markerImg} 
           height=40
           style='transform: rotate(${item.direction}deg);margin:0 auto'/>
           <span style='algin'>${item.carNo}</span>
           </div>`,
          className: 'truck_icon'
        })
        const marker = L.marker(
          [item.lat, item.lng],
          {
            icon,
            title: item.carNo
          })
        marker.bindPopup(
          `
      <div class="title">
        <div style="float: left">
          <div class="name">
            <div>${item.carNo}</div>
            <div>${item.orgName}</div>
          </div>
          <div class="type">燃油车</div>
        </div>
        <img
          src=${videoImg}
          width="30px"
          height="30px"
          style="float: right;margin-right:40px;margin-top:3px"
        />
      </div>
      <div class="body">
        <div class="speed">车速:${item.speed} km/h</div>
        <div style="display:flex;justify-content:space-between;float:none">
          <span style="width: 50%;">车辆状态:</span>
          <span style="width: 50%;">定位状态：定位</span>
        </div>
        <div>当前状态持续：29分钟30秒</div>
        <div>最后定位时间：2023-10-10 16.17.04</div>
        <div>最后定位位置：陕西省西安市高陵区姬家街道陕汽研究院陕汽工业园</div>
      </div>
`, {
          className: 'detail',
          maxWidth: '320px',
        }
        ).openPopup();
        this.truckLayer.addLayer(marker)
      })
      this.map.addLayer(this.truckLayer)
    }
  }
}
</script >

<style >
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
.truck_icon {
  color: #707070;
  font-size: 0.75rem;
  text-align: center;
}

/* 信息弹框 */

.detail {
  margin: 0;
  padding: 0;
  width: 360px;
}
.leaflet-popup-content-wrapper {
  background: transparent;
  box-shadow: none;
}
.leaflet-container a.leaflet-popup-close-button {
  top: 15px;
  right: 32px;
  color: #fff;
  font-size: 20px;
}
.leaflet-popup-tip {
  width: 0px;
  height: 0px;
}
.title {
  background-color: #2ea35d;
  height: 35px;
}
.body {
  font-size: 14px;
  height: 200px;
  background-color: #fff;
}
.body .speed {
  width: 100%;
  padding-top: 15px;
  font-size: 24px;
  text-align: center;
}
.body div {
  float: left;
  font-size: 14px;
  line-height: 30px;
  padding: 0 10px;
}
.name {
  float: left;
  font-size: 14px;
  cursor: default;
  color: #fff;
}
.name div {
  padding: 0 10px;
}
.type {
  float: left;
  height: 18px;
  padding: 0 6px;
  margin-left: 10px;
  margin-top: 3px;
  background: #fff;
  border-radius: 5px;
  color: #ffa46b;
  line-height: 18px;
  text-align: center;
  font-size: 14px;
  cursor: default;
}
.map-tool .el-checkbox-group {
  line-height: normal;
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
.tool-img {
  width: 18px;
  margin-right: 5px;
}
</style>