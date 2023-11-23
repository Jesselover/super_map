<template>
  <div class="historicalTrack-page"
       id="historicalTrack">
    <!-- 左侧卡片区域 -->
    <div class="left-box">
      <!-- v-show="showTree" -->
      <div id="nav_tool_bar">
        <div class="his-title">历史轨迹</div>
        <el-button class="btn"
                   type="primary"
                   icon="el-icon-search"
                   size="mini"
                   @click="inquireBtn()"
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
            <div class="video-btn"
                 :style="{ left: fillWidth }"></div>
            <div id="slider"></div>
          </div>
          <div class="nav-toolBar-time">
            <span v-if="renderBottom.removeTime != ''">{{
                renderBottom.removeTime
              }}</span>
            <span v-else>00:00:00</span>
          </div>
        </div>
        <div class="margin-left115">
          <img @click="handleLowSpeed(1)"
               src="@/assets/images/historicalTrack/left_icon.png" />
          <img id="start"
               v-show="!isPlaying"
               @click="startAnimation()"
               class="navig-btn"
               data-btn-idx="0"
               data-act="start"
               src="@/assets/images/historicalTrack/player_icon.png" />
          <img id="pause"
               v-show="isPlaying"
               @click="pauseAnimation()"
               class="navig-btn"
               data-btn-idx="1"
               data-act="pause"
               src="@/assets/images/historicalTrack/stop_icon.png" />
          <img @click="handleLowSpeed(2)"
               src="@/assets/images/historicalTrack/right_icon.png" />
          <span>
            播放速度为：
            {{ currSpeed }}
          </span>
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
            <!-- <div class="margin-top3">
              <span class="labelspan">起点位置：</span>
              <span>{{ renderBottom.startAddress }}</span>
            </div> -->
            <div class="margin-top3">
              <span class="labelspan">终点时间：</span>
              <span v-if="renderBottom.endTime != ''">{{
                  renderBottom.endTime
                }}</span>
              <span v-else>00:00:00</span>
            </div>
            <!-- <div class="margin-top3">
              <span class="labelspan">终点位置：</span>
              <span>{{ renderBottom.endAddress }}</span>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <!-- 地图 -->
    <div class="map-container"
         id="map-container">
    </div>
  </div>
</template>
<script>
// import DetailWindow from './info.vue'
import { Message, MessageBox } from "element-ui";
import L from 'leaflet';
import MovingMarker from "./MovingMarker.js"
import 'leaflet-rotatedmarker'
import { TiledMapLayer, GeoDecodingParameter, AddressMatchService } from '@supermap/iclient-leaflet'; // 只支持按需引入
import myData from "./myData"
export default {
  name: "HistoricalTrack",
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
        require("@/assets/images/historicalTrack/track_start.png"), // 起点
        require("@/assets/images/historicalTrack/track_end.png"),  // 终点
        require("@/assets/images/historicalTrack/leader.png"),  // 停车点
        require("@/assets/images/historicalTrack/leader.png") // 巡航器图标
      ],
      leader: null,
    };
  },
  computed: {
    per () {
      const per = this.fomatFloat(this.FILL_WIDTH / this.mapData.length, 2)
      return per
    } // 进度条进度
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
        center: [34.1529, 108.5632], // 地图中心点
        zoomControl: false, //是否显示缩放比空间
        zoom: 10, //初始缩放比
      });
      this.amapLayer.addTo(this.map)
    },
    // 绘制轨迹线
    createPolyline () {
      // this.getAddress([
      //   [this.mapData[0].gdLat, this.mapData[0].gdLng],
      //   [
      //     this.mapData[this.mapData.length - 1].gdLat,
      //     this.mapData[this.mapData.length - 1].gdLng,
      //   ],
      // ]);
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
      if (this.latlngs.length > 1) {
        //  轨迹点大于 1 ，画轨迹
        this.polyline = L.polyline(this.latlngs, { color: 'hotpink' })
        this.detailLayer.addLayer(this.polyline)
        // zoom the map to the polyline
        this.map.fitBounds(this.polyline.getBounds());
        this.createLeader() // 添加巡航器
      }
      this.loading = false;
      this.boxLoading = false;
    },
    createLeader () {
      // 清除之前巡航器
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
      // 巡航器角度改变
      this.movingArrow.setRotationAngle(this.mapData[this.startIndex].dir)
      // 视野锁定巡航器
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
        // 当动画播放时， 使用进度条,让巡航器快进/ 快退到某点,视野
        this.hasChangeIndex = false
        this.movingArrow.setLatLng(this.latlngs[this.startIndex])
        this.movingArrow.setRotationAngle(this.mapData[this.startIndex].dir)
        this.map.setView(this.latlngs[this.startIndex])
      }
      // 进度条进度
      this.fillWidth = parseFloat(this.per * this.startIndex) + "px";
      setTimeout(() => {
        if (this.startIndex < this.mapData.length - 1) {
          this.renderBottom.removeTime = this.mapData[this.startIndex].dataTime
          let duration // 点与点之间移动的时间
          if (this.latlngs[this.startIndex][0] == this.latlngs[this.startIndex + 1][0] && this.latlngs[this.startIndex][1] == this.latlngs[this.startIndex + 1][1]) {
            duration = 1
          } else {
            const temp = (new Date(this.mapData[this.startIndex + 1].dataTime).getTime() - new Date(this.mapData[this.startIndex].dataTime).getTime()) / 10 / this.currSpeed
            duration = temp > 2000 ? 2000 : temp
          }
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
    getAddress (latlngs) {
      const temp = [];
      latlngs.forEach((latlng) => {
        temp.push(latlng[1]);
        temp.push(latlng[0]);
      });
      const locStr = temp.join();
      const params = {
        batch: true,
        location: locStr,
        enc: "GBK",
        extensions: "all",
        output: "json",
        key: "6c90befb2bdec52ca5e71806886b5d63",
      };
      trackRenderApi.getAddress(params).then((res) => {
        if (res.status == 200) {
          const data = res.data.regeocodes;
          this.renderBottom.startAddress = data[0].formatted_address;
          this.renderBottom.endAddress = data[1].formatted_address;
        }
      });
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
        this.moveToPoint(index); // 动画位置改变
        this.startIndex = index;
        this.fillWidth = width + "px"; // 进度条长度改变
      } else {
        Message.warning("请先查询车辆历史轨迹！");
      }
    },
    // 移动到某点
    moveToPoint (index) {
      this.startIndex = index // startIndex 控制动画开始于latlngs数组的哪一个index
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
        this.map.setZoom(18)
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
      this.mapData = myData.data.data
      console.log(this.mapData)
      this.latlngs = this.mapData.map(i => {
        return [i.lat, i.lng]
      })
      this.renderBottom.startTime = this.mapData[0].dataTime;
      this.renderBottom.endTime =
        this.mapData[this.mapData.length - 1].dataTime;
      this.createPolyline()
    },
  },
};
</script>
<style lang="scss" scoped>
@import url('~@/assets/scss/main.scss');
.map-container {
  position: absolute;
  left: 300px;
  top: 0;
  width: calc(100% - 300px);
  height: 100%;
}
// 巡航器
#wrapper {
  background-color: #fff;
  position: relative;
  border-radius: 15px;
  margin-top: 15px;
  border: none;
  width: 100%;
}
#fill {
  display: inline-block;
  position: absolute;
  left: 0;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(45deg, pink, transparent);
}
.video-btn {
  display: inline-block;
  position: absolute;
  left: 0;
  width: 10px;
  height: 10px;
  background: hotpink;
  border-radius: 50%;
  border: 1px solid #fff;
  cursor: pointer;
  margin-top: -1px;
}
#pause,
#start {
  margin: 0 10px;
}
#nav_tool_bar {
  height: calc(100% - 236px);
  width: 280px;
  background: white;
  .his-video {
    padding: 0 25px 0 15px;
  }
  .btn {
    margin: 10px auto;
  }

  #slider {
    background: none;
    height: 10px;
  }
  .nav-toolBar-time {
    padding-top: 5px;
    display: flex;
    justify-content: space-between;
    color:hotpink;
    font-style: inherit;
  }
  .his-title {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid hot;
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
  .route-item {
    margin-top: 5px;
  }
  .margin-top3 {
    margin-top: 3px;
    display: flex;
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


