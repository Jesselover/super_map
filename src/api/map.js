const axios = require("axios");

function getAddress(){
	axios
    .get(`https://restapi.amap.com/v3/geocode/regeo?${parameters}`)
    .then(function (response) {
      // 处理成功情况
      console.log(response);
    })
    .catch(function (error) {
      // 处理错误情况
      console.log(error);
    })
    .finally(function () {
      // 总是会执行
    });
}