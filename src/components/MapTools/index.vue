<template>

</template>

<script>
export default {

}
</script>

<style>
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