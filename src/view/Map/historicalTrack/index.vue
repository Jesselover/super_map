<template>
  <div class="historicalTrack-page"
       id="historicalTrack">
    <!-- 左侧卡片区域 -->
    <div class="left-box">
      <!-- v-show="showTree" -->
      <div class="com">
        <div class="his-title">历史轨迹</div>
        <el-button class="btn"
                   type="primary"
                   fillWidth
                   icon="el-icon-search"
                   size="mini"
                   @click="inquireBtn('form')"
                   :loading="loading">查询</el-button>
      </div>
      <!-- 历史轨迹播放操作  -->
      <div id="nav_tool_bar">
        <div class="his-title">轨迹播放</div>
        <div class="his-video">
          <div id="wrapper"
               @click="handleSlider">
            <div id="fill"
                 :style="{ width: fillWidth }"></div>
            <div id="slider"
                 :style="{ left: fillWidth }">
              <div class="video-btn"></div>
            </div>
          </div>
          <!-- <div class="nav-toolBar-time">
              <span>{{videoStartTime}}</span>
              <span>{{videoEndTime}}</span>
            </div>-->
          <div class="nav-toolBar-time">
            <span v-if="renderBottom.removeTime != ''">{{
                renderBottom.removeTime
              }}</span>
            <span v-else>00:00:00</span>
          </div>
          <div class="margin-left115">
            <img @click="handleLowSpeed(1)"
                 src="./imgs/left_icon.png" />
            <img id="start"
                 v-show="!isPlaying"
                 @click="startAnimation()"
                 class="navig-btn"
                 data-btn-idx="0"
                 data-act="start"
                 src="./imgs/player_icon.png" />
            <img id="pause"
                 v-show="isPlaying"
                 @click="pauseAnimation()"
                 class="navig-btn"
                 data-btn-idx="1"
                 data-act="pause"
                 src="./imgs/stop_icon.png" />
            <img @click="handleLowSpeed(2)"
                 src="./imgs/right_icon.png" />
            <span id="track_player_speed">
              播放速度为：
              <em>{{ currSpeed }}</em>
            </span>
          </div>
        </div>
        <div class="his-cont"
             v-loading="boxLoading"
             element-loading-text="加载中"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(255, 255, 255, 0.8)">
          <div class="route-item">
            <div class="margin-top3">
              <span class="labelspan">起点时间：</span>
              <span v-if="renderBottom.startTime != ''">{{
                  renderBottom.startTime
                }}</span>
              <span v-else>00:00:00</span>
            </div>
            <div class="margin-top3">
              <span class="labelspan">起点位置：</span>
              <span>{{ renderBottom.startAddress }}</span>
            </div>
            <div class="margin-top3">
              <span class="labelspan">终点时间：</span>
              <span v-if="renderBottom.endTime != ''">{{
                  renderBottom.endTime
                }}</span>
              <span v-else>00:00:00</span>
            </div>
            <div class="margin-top3">
              <span class="labelspan">终点位置：</span>
              <span>{{ renderBottom.endAddress }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 地图 -->
    <div class="map-container"
         id="map-container">
    </div>
    <!-- <DetailWindow ref="detailWindow">
    </DetailWindow> -->
  </div>
</template>
<script>
// import DetailWindow from './info.vue'
import { Message, MessageBox } from "element-ui";
import L from 'leaflet';
import MovingMarker from "./MovingMarker.js"
import 'leaflet-rotatedmarker'
import { TiledMapLayer, GeoDecodingParameter, AddressMatchService } from '@supermap/iclient-leaflet'; // 只支持按需引入
import { data } from "./myData"
export default {
  name: "HistoricalTrack",
  components: {
    localShortcutTime, localCarTree, DetailWindow
  },
  data () {
    return {
      isShow: false,
      boxLoading: false, //盒子loading
      loading: false,
      // step 播放器
      renderBottom: {
        //表格筛选参数
        startTime: "",
        endTime: "",
        startAddress: "",
        endAddress: "",
        mileage: 0,
        carStopTime: 0,
        park: false,
        speedType: "",
        removeTime: "",
      },
      startIndex: 0,
      isPlaying: false,
      isPause: false,
      isPlayed: false,
      currSpeed: 1, //速度
      FILL_WIDTH: 235, // 进度条宽度
      fillWidth: 0, // 进度条宽度
      showSlider: false, //是否显示slider
      percentage: 0, // 进度条进度
      addrIdx: 0,
      hasChangeIndex: false,
      // step map
      map: null,
      detailLayer: null,
      polyline: null,
      movingArrow: null,
      popup: null,
      mapData: [],
      latlngs: [],
      iconUrl: [
        //起终点icon
        require("./imgs/track_start.png"), // 起点
        require("./imgs/track_end.png"),  // 终点
        require("./imgs/track_map_ico_park.png"),  // 停车点
        require("./imgs/leader.png") // 巡航器图标
      ],
      leader: null,
    };
  },
  computed: {
    duration () {
      if (this.mapData.length && this.renderBottom.endTime && this.renderBottom.startTime) {
        return (new Date(this.renderBottom.endTime).getTime() - new Date(this.renderBottom.startTime).getTime()) / 10 / this.currSpeed / this.mapData.length
      }
    },
    per () {
      const per = this.fomatFloat(this.FILL_WIDTH / this.mapData.length, 2)
      return per
    }
  },
  created () {
  },
  mounted () {
    this.initMap()
  },
  methods: {
    // step map
    initMap () {
      // 加载 open street map 图层服务
      this.amapLayer = L.tileLayer("http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
        attribution: '&copys; 高德地图', //用来进行属性控制的字符串，描述了图层数据
        maxZoom: 18, //map 对象中的 maxZoom 属性是必须的，否则在创建 **makerClusterGroup ** 会报错
        minZoom: 3,
        subdomains: "1234", // 子域名，替换{s}
      })
      this.map = L.map('map-container', {
        center: [34.96, 108.19],
        zoomControl: false,
        zoom: 10,
      });
      this.amapLayer.addTo(this.map)
    },
    // 绘制轨迹线
    createPolyline () {
      // 清除之前的轨迹
      if (this.detailLayer) {
        this.map.removeLayer(this.detailLayer)
        this.detailLayer.clearLayers()
        this.polyline = null
      }
      // 起点、终端marker
      const start = L.marker(this.latlngs[0], {
        icon: L.icon({
          iconSize: [30, 35],
          iconUrl: this.iconUrl[0],
          iconAnchor: [15, 35]
        })
      })
      const end = L.marker(this.latlngs[this.latlngs.length - 1], {
        icon: L.icon({
          iconSize: [30, 35],
          iconUrl: this.iconUrl[1],
          iconAnchor: [15, 35]
        })
      })
      this.detailLayer = L.layerGroup([start, end]).addTo(this.map)
      if (this.mapData.length > 1) {
        //  轨迹点大于 1 ，画轨迹
        this.polyline = L.polyline(this.latlngs, { color: 'blue' })
        this.detailLayer.addLayer(this.polyline)
        // zoom the map to the polyline
        this.map.fitBounds(this.polyline.getBounds());
        this.createLeader() // 添加巡航器
      }
      this.loading = false;
      this.boxLoading = false;
    },
    createLeader () {
      if (this.movingArrow) {
        this.detailLayer.removeLayer(this.movingArrow)
        this.movingArrow = null
        console.log('removeLayer(this.movingArrow))')
      }
      // 巡航器初始化
      this.movingArrow = L.Marker.movingMarker(this.latlngs.slice(0, 2), 2000).addTo(this.detailLayer);
      this.movingArrow.setIcon(L.icon({
        iconUrl: this.iconUrl[3], //  巡航器icon
        iconSize: [30, 40],
        iconAnchor: [15, 40]
      }))
      this.movingArrow.setRotationAngle(this.mapData[this.startIndex].dir)
      this.map.setView(this.movingArrow.getLatLng())
      this.startIndex = 1
      //  下一步，从latlngs[1]-->latlngs[2]
      this.movingArrow.on('end', () => {
        this.addPoint()
      })
    },
    addPoint () {
      if (!this.isPlaying) {
        return   // 完成已绑定的动画后直接退出，后续无法监听到end时间，动画结束
      }
      if (this.hasChangeIndex) {
        //  move to point when playing
        this.hasChangeIndex = false
        this.movingArrow.setLatLng(this.latlngs[this.startIndex])
        this.movingArrow.setRotationAngle(this.mapData[this.startIndex].dir)
        this.map.setView(this.latlngs[this.startIndex])
      }
      this.fillWidth = parseFloat(this.per * this.startIndex) + "px";
      setTimeout(() => {
        if (this.startIndex < this.mapData.length - 1) {
          this.renderBottom.removeTime = this.mapData[this.startIndex].dataTime
          let duration
          if (this.latlngs[this.startIndex][0] == this.latlngs[this.startIndex + 1][0] && this.latlngs[this.startIndex][1] == this.latlngs[this.startIndex + 1][1]) {
            // console.log('经纬度相同')
            duration = 1
          } else {
            const temp = (new Date(this.mapData[this.startIndex + 1].dataTime).getTime() - new Date(this.mapData[this.startIndex].dataTime).getTime()) / 10 / this.currSpeed
            duration = temp > 2000 ? 2000 : temp
            // console.log('经纬度不同')
          }
          console.log(this.latlngs[this.startIndex], this.latlngs[this.startIndex + 1], duration, '--------')
          this.map.setView(this.movingArrow.getLatLng())
          this.movingArrow.moveTo(this.latlngs[++this.startIndex], duration)
          this.movingArrow.setRotationAngle(this.mapData[this.startIndex].dir)
          if (this.startIndex == this.latlngs.length - 1) {
            Message.warning("历史轨迹播放完毕！");
            this.isPlaying = false
          }
        }
      }, 0);
    },
    fomatFloat (src, pos) {
      return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
    },
    // step 播放器
    // 进度条点击
    handleSlider (e) {
      if (this.movingArrow) {
        let offsetX = e.offsetX;
        let width = "";
        if (offsetX > 230) {
          width = 230;
        } else if (offsetX < 20) {
          width = 0;
        } else {
          width = offsetX - 10;
        }
        let num = this.mapData.length;
        let per = width / 230;
        let index = Math.floor(per * num);
        this.moveToPoint(index);
        this.startIndex = index;
        this.fillWidth = width + "px";
      } else {
        Message.warning("请先查询车辆历史轨迹！");
      }
    },
    // 移动到某点
    moveToPoint (index) {
      this.startIndex = index
      if (this.isPlaying) {
        this.hasChangeIndex = true
      } else {
        this.movingArrow.setLatLng(this.latlngs[this.startIndex])
        this.movingArrow.setRotationAngle(this.mapData[this.startIndex].dir)
        this.map.setView(this.latlngs[this.startIndex])
      }
    },
    // 开始
    startAnimation () {
      if (this.movingArrow && !this.isPlaying) {
        this.isPlaying = true
        this.map.setZoom(16)
        this.addPoint()
      }
    },
    // 暂停
    pauseAnimation () {
      if (this.movingArrow && this.isPlaying) {
        // this.movingArrow.pause()
        this.isPlaying = false
      }
    },
    // 加减速按钮
    handleLowSpeed (type) {
      if (!this.movingArrow) return
      if (type == 1) {
        if (this.currSpeed == 1) {
          this.currSpeed = 0.5;
        } else if (this.currSpeed > 1) {
          this.currSpeed--;
        }
      } else {
        if (this.currSpeed == 0.5) {
          this.currSpeed = 1;
        } else if (this.currSpeed < 4) {
          this.currSpeed++;
        }
      }
    },
    // step 查询
    // 点击查询按钮
    inquireBtn (formName) {
      console.log(formName)
      this.mapData = data.data
      this.latlngs = this.mapData.map(i => {
        return [i.lat, i.lng]
      })
    },
  },

};
</script>
<style lang="scss" scoped>
.map-container {
  position: absolute;
  left: 300px;
  top: 0;
  width: calc(100% - 300px);
  height: 100%;
}
.truck_icon {
  color: #707070;
  font-size: 0.75rem;
  text-align: center;
}
</style>
<style scoped src="./style.css"></style>
<style scoped>
#wrapper {
  background-color: #ededed;
  position: relative;
  border-radius: 15px;
  margin-top: 15px;
  border: none;
  width: 100%;
}

#pause,
#start {
  margin: 0 10px;
}

#fill {
  height: 10px;
  background: linear-gradient(45deg, #206eff, transparent);
}

::v-deep .el-checkbox {
  margin: -2px 4px 0;
}

.iconDiv {
  cursor: pointer;
  padding: 0 10px;
  font-size: 12px;
}

.iconDiv:hover {
  background: #eee;
}

.fas {
  margin-right: 10px;
  font-size: 14px;
  line-height: 32px;
}

::v-deep .el-form-item {
  margin-bottom: 0;
}

::v-deep .el-form-item__content {
  width: 170px;
}

::v-deep .el-date-editor {
  width: 170px;
}

.speed >>> .el-form-item__content {
  width: 135px !important;
}

.speed {
  position: relative;
}

.kmh {
  position: absolute;
  right: -45px;
  top: 0;
}

.btn {
  float: right;
  margin: 5px 25px;
}

.select .el-select-dropdown__item {
  font-size: 12px;
  height: 24px;
  line-height: 24px;
}

.select .el-select-dropdown__list {
  padding-left: 0;
}

.top-card {
  z-index: 5;
  background: #fff;
}

.his-title {
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #dedede;
  font-size: 15px;
  font-weight: 400;
  padding-left: 15px;
  color: #333;
}

.his-cont {
  overflow-y: scroll;
  height: calc(100% - 120px);
  padding: 0 26px 0 10px;
}

::-webkit-scrollbar {
  width: 2px;
}

::v-deep .el-checkbox__label {
  padding: 0 6px;
  font-size: 12px;
}

.bottomCom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 400px;
  height: 100px;
  background: #fff;
  font-size: 12px;
}

.bottomComLeft {
  width: 65%;
  height: 100%;
  float: left;
  padding: 20px;
}

.bottom-com-right {
  color: #666666;
  font-size: 12px;
  height: 50px;
  background: white;
  padding-left: 15px;
}

.stop-event {
  display: inline-block;
}

.iconCom {
  width: 120px;
  margin: 0 auto;
}

.iconCom i {
  font-size: 20px;
  cursor: pointer;
  vertical-align: middle;
  font-weight: 900;
  color: #409eff;
}

.iconCom span {
  vertical-align: middle;
  font-size: 16px;
}

.iconCom .navg {
  font-size: 30px;
  font-weight: 100;
  padding: 0 10px;
}

.stop-time {
  width: 120px !important;
}

.com input {
  border: 1px solid;
}

.route-item {
  margin-top: 5px;
}

/* 树形数据样式 */
.tree ::v-deep .el-tree {
  height: max-content;
  max-height: 360px;
  min-height: 300px;
  min-width: 160px;
  overflow: auto;
  position: absolute;
  z-index: 2002;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 0 5px 2px rgb(0 0 0 / 10%);
}

.bottom-card240 {
  left: 280px;
  width: calc(100% - 280px);
}

.bottom-card-box > span {
  margin: 0;
}

.leftIcon {
  position: absolute;
  top: 34px;
  right: -7px;
  cursor: pointer;
}

.rightIcon {
  position: absolute;
  top: 34px;
  left: 2px;
  cursor: pointer;
  z-index: 999;
}

.comleft_iconp {
  width: 16px;
  height: 100px;
  left: 280px;
  top: 66px;
  background-color: #1890ff;
  position: absolute;
  z-index: 100;
}

.comright_iconp {
  width: 16px;
  height: 100px;
  left: 0px;
  top: 66px;
  background-color: #1890ff;
  position: absolute;
  z-index: 100;
}

.bottom-card-box {
  width: 100%;
  height: 40px;
  cursor: pointer;
  z-index: 2000;
  bottom: 0;
  background: #fff;
  line-height: 40px;
}

.bottom-card-box span {
  font-size: 12px;
  cursor: pointer;
}

.bottom-show-tree {
  display: inline-block;
  width: 76px;
  height: 40px;
  background: #206eff;
  line-height: 40px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  color: #fff;
  border-radius: 0;
  z-index: 2000;
  bottom: 0;
}

.bottom-show-tree.color {
  background: #fff;
  color: #333;
}

.bottom-show-tree {
  float: left;
}

.icon-up-down {
  position: absolute;
  right: 20px;
  top: 12px;
}

.iconUpMiddle {
  position: absolute;
  right: 50px;
  top: 12px;
}

::v-deep .el-checkbox__label {
  padding: 0 6px;
  font-size: 12px;
}

::v-deep .el-select {
  width: 100%;
}

.table {
  transition-duration: 0.3s;
}

.pagination {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  /* z-index: -1; */
  z-index: -1;
  background: #fff;
}

.el-table {
  z-index: -2;
}

.video-btn {
  width: 10px;
  height: 10px;
  background: #206eff;
  border-radius: 50%;
  border: 1px solid #fff;
  cursor: pointer;
  margin-top: 2px;
  margin-left: 3px;
}

#slider {
  background: none;
}

.bottom-card-box /deep/.el-radio-button--medium .el-radio-button__inner {
  padding: 0px;
  border: none;
}

.el-radio-button {
  height: 40px;
  line-height: 40px;
  width: inherit;
  padding: 0 20px;
}

.mapBox /deep/.bottom-card240 {
  left: 296px;
  width: calc(100% - 296px);
}

.left-box /deep/.el-form-item__content,
.left-box /deep/.el-form-item__label {
  line-height: 33px;
}

.his-video {
  padding: 0 25px 0 15px;
}

.left-box /deep/.el-form-item__label {
  padding: 0;
}

.left-box /deep/.el-form {
  margin-top: 6px;
  width: 100%;
}

.left-box {
  background: none;
  margin: 0;
  overflow: inherit;
  height: 100%;
  z-index: 1;
}

.el-radio-button:focus:not(.is-focus):not(:active):not(.is-disabled) {
  box-shadow: none;
}

#nav_tool_bar {
  height: calc(100% - 236px);
  width: 300px;
  background: white;
}

#nav_tool_bar.com-type {
  height: calc(100% - 276px);
}

#nav_tool_bar,
.com {
  background: #fff;
  border-radius: 3px;
  width: 280px;
}

#tableTab /deep/.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  color: #206eff;
  background: #fff;
  box-shadow: none;
}

#tableTab /deep/ .el-radio-button--medium .el-radio-button__inner,
#tableTab /deep/.el-radio-button__inner:hover {
  color: #333;
}

#tableTab {
  width: calc(100% - 210px);
  float: left;
}

#tableTab > div {
  overflow: auto;
  display: flex;
}

.com {
  margin-bottom: 10px;
  height: 226px;
}

.com.com-type {
  height: 266px;
}

.nav-toolBar-time {
  display: flex;
  justify-content: space-between;
}

#track_player_speed {
  font-size: 12px;
}

#track_player_speed em {
  color: #206eff;
  font-style: inherit;
}

.left-box /deep/ .el-input--prefix .el-input__inner {
  padding-right: 10px;
}

.left-box /deep/.el-input__prefix {
  left: 0;
}

.tree /deep/ .el-input--mini .el-input__inner {
  width: 170px !important;
}

.data-time /deep/ .el-select-dropdown__item {
  height: 30px;
  line-height: 30px;
}
</style>
<style scoped lang="scss">
::v-deep .el-form-item {
  margin-bottom: 0;
}

::v-deep .el-form-item__content {
  width: 180px;
}

::v-deep .el-date-editor {
  width: 180px !important;
}
#wrapper {
  background-color: #ededed;
  position: relative;
  border-radius: 15px;
  margin-top: 15px;
  border: none;
  width: 100%;
}
#pause,
#start {
  margin: 0 10px;
}
#fill {
  height: 10px;
  background: linear-gradient(45deg, #206eff, transparent);
}
.left-box {
  background: none;
  margin: 0;
  overflow: inherit;
  height: 100%;
  width: 280px;
  z-index: 1;
  ::v-deep .el-input__prefix {
    left: 0;
    .el-input__inner {
      padding-right: 10px;
    }
  }
  ::v-deep .el-form-item__content,
  ::v-deep .el-form-item__label {
    line-height: 33px;
    padding: 0;
  }
  ::v-deep .el-form {
    margin-top: 6px;
    width: 100%;
  }
}
.com {
  margin-bottom: 10px;
  height: 226px;
}
.his-title {
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #dedede;
  font-size: 15px;
  font-weight: 400;
  padding-left: 15px;
  color: #333;
}
/* 树形数据样式 */
.tree ::v-deep .el-tree {
  height: max-content;
  max-height: 360px;
  min-height: 300px;
  min-width: 160px;
  overflow: auto;
  position: absolute;
  z-index: 2002;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 0 5px 2px rgb(0 0 0 / 10%);
}
.tree {
  padding: 0px;
}
.tree ::v-deep .el-input--mini .el-input__inner {
  width: 180px !important;
}
.data-time ::v-deep .el-select-dropdown__item {
  height: 30px;
  line-height: 30px;
}
.btn {
  float: right;
  margin: 5px 25px;
}
</style>
<style lang="scss">
.historicalTrack-page {
  .el-form-item {
    margin-bottom: 1px !important;

    .el-form-item__label::before {
      display: none;
    }
  }

  .left-box {
    background: #fff !important;
  }

  .bottom-card {
    bottom: -1px;
  }

  .com-type .el-input,
  .com-type .el-input__inner {
    width: 180px !important;
  }

  .left-box {
    .com {
      margin-bottom: 0;

      .el-button {
        float: none;
        margin: 5px auto;
        display: block;
      }
    }
  }

  .margin-left115 {
    display: flex;
    align-items: center;

    span {
      top: 0;
    }
  }
}

.maoCmp {
  height: calc(100vh - 94px);

  ::v-deep .amap-icon img {
    width: 100%;
  }

  ::v-deep .com {
    height: 300px;
  }

  ::v-deep .bottom-card240 {
    z-index: 998 !important;
  }

  ::v-deep .el-date-editor.el-input {
    width: 100% !important;
  }

  ::v-deep .top-card {
    z-index: 1000;
  }
}
#nav_tool_bar {
  height: calc(100% - 236px);
  width: 280px;
  background: white;
  .com {
    background: #fff;
    border-radius: 3px;
    width: 280px;
  }
  .his-video {
    padding: 0 25px 0 15px;
  }
  .video-btn {
    width: 10px;
    height: 10px;
    background: #206eff;
    border-radius: 50%;
    border: 1px solid #fff;
    cursor: pointer;
    margin-top: 2px;
    margin-left: 3px;
  }
  #slider {
    background: none;
  }
  .nav-toolBar-time {
    display: flex;
    justify-content: space-between;
  }
  .nav-toolBar-time {
    display: flex;
    justify-content: space-between;
    em {
      color: #206eff;
      font-style: inherit;
    }
  }
  .his-cont {
    overflow-y: scroll;
    height: calc(100% - 120px);
    padding: 0 26px 0 10px;
  }
  .route-item {
    margin-top: 5px;
  }
  .marginTop3 {
    margin-top: 3px;
    display: flex;
    .labelspan {
      min-width: 60px;
    }
  }
  .margin-left115 {
    margin: 4px 0 1px;
    img {
      width: 20px;
      height: 20px;
    }
    span {
      margin-left: 20px;
      position: relative;
      top: -4px;
    }
  }
}
</style>

