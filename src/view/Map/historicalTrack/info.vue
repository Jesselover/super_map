<template>
  <div class="onfo">
    <div class="title"
         :style="getTitlebg">
      <div style="float: left">
        <div class="name">
          <div class="car_no">{{nowDetail.carNo}}</div>
          <div>{{nowDetail.orgName}}</div>
        </div>
        <div class="type">{{nowDetail.fuelTypeName}}</div>
      </div>
      <img @click="phoneCall"
           :src="videoImg"
           width="30px"
           height="30px"
           style="float: right;margin-right:40px;margin-top:3px" />
    </div>
    <div class="body">
      <div class="speed">{{nowDetail.speed}} km/h</div>
      <div style="display:flex;justify-content:space-between;float:none">
        <span style="width: 50%;">车辆状态:{{nowDetail.onLineBusText}}</span>
        <span style="width: 50%;">定位状态：{{nowDetail.statusText}}</span>
      </div>
      <div>当前状态持续：{{nowDetail.durationTime}}</div>
      <div>最后定位时间：{{nowDetail.driveOrPackCarTM}}</div>
      <div>最后定位位置：陕西省西安市高陵区姬家街道陕汽研究院陕汽工业园</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "info",
  props: {
    nowDetail: {
      default: () => {
        return {};
      },
      type: Object,
    },
    isCall: {
      default: false,
      type: Boolean,
    }
  },
  data () {
    return {
    }
  },

  computed: {
    getTitlebg () {
      if (this.nowDetail.onLineBus == 1) {
        return 'background-color: #2EA35D;'
      }
      if (this.nowDetail.onLineBus == 2) {
        return 'background-color: #FFB120;'
      }
      if (this.nowDetail.onLineBus == 3) {
        return 'background-color: #999;'
      }
    },
    isCall_ () {
      return this.isCall
    },
    videoImg () {
      if (!this.isCall_) {
        return require('/src/assets/images/video1.png')
      } else {
        return require('/src/assets/images/video2.png')
      }
    },
  },
  methods: {
    phoneCall () {
      this._isCall = true
      // this.videoImg = require('/src/assets/images/video2.png')
      this.$emit('openPhone',this._isCall)
    }
  }
}
</script>

<style>
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
  height: 37px;
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
.car_no {
  width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
</style>