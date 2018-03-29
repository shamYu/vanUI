/*
* @ 基于anbgular自定义指令的前端UI组件
* @ author yuwpower
* @ date 2018/03/26
* @ VanUI
 */
/*
 *
 @ 百度地图组件
 @ 2017/12/7
 @ 余旺
 *
 */
Platform_Directive_APP.directive('powerMap', function () {
    return {
        restrict: 'AE',
        scope: {
            ngModelJd: '=', // 经度
            ngModelWd: '=', // 纬度
            mapLevel: '@',
            ngWidth: '@',
            mgHeight: '@'
        },
        template: '<div id="{{mapId}}" style="width:{{ngWidth}};height:{{ngHeight}};overflow:hidden;margin:0;"></div>',
        transclude: true,
        controller: function ($scope, $http, $timeout, $window, $location) {
            var mapId = powerUtil.UUID()
            $scope.mapId = mapId
            $timeout(function () {
                var map = new BMap.Map(mapId)
                var level = $scope.mapLevel || 12; // 默认地图缩放级别12
                var jd = $scope.ngModelJd || 116.404 // 默认定位到北京
                var wd = $scope.ngModelWd || 39.915
                var point = new BMap.Point(jd, wd)
                map.centerAndZoom(point, level)
                function showInfo (e) {
                    $scope.ngModelJd = e.point.lng
                    $scope.ngModelWd = e.point.lat
                    $scope.$apply()
                }
                var marker = new BMap.Marker(point); // 创建标注
                map.addOverlay(marker)
                marker.enableDragging()
                map.addEventListener('click', showInfo)
                map.enableScrollWheelZoom()
            }, 500)
        },
        link: function (scope, elem, attr) {
            scope.ngWidth = scope.ngWidth || '100%'
            scope.ngHeight = scope.ngHeight || '300px'
        }
    }
})

/*
 @自定义ng-load 指令 相当于window.onload
 @余旺
 @2017/12/13
 */
Platform_Directive_APP.directive('ngLoad', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('load', function () {
                scope.$apply(attrs.ngLoad)
            })
        }
    }
})

/*
 @地图弹层
 @余旺
 @2018/3/6
 */
Platform_Directive_APP.directive("powerLayerMap",function(){
    return{
        restrict:'EA',
        scope:{
            ngModelJd: '=', // 经度
            ngModelWd: '=', // 纬度
        },
        templateUrl:function(){
            return Common.webRoot()+"/resources/power-ui/plug-directive/template/map/map.html";
        },
        transclude: true,
        controller:function($scope, $http, $timeout, $window, $location){
            $scope.isShowMap = false;
            $scope.showMap = function(){
                $scope.isShowMap = !$scope.isShowMap;
            }
        },
        link:function(scope, elem, iAttrs){

        }
    }
})

/*基于echarts根据行政区号代码切换省市区地图的组件*/
Platform_Directive_APP.directive("vanMap",function(){
	return{
		restrict:'AE',
		scope:{
			xzqhDm:'=',     
			mapId:'@',
			mapLeve:"@",
			ngWidth:"@",
			ngHeight:"@",
			vanText:'@',
			dataOption:'='   //可自行根据echarts定义热力图、点位图、迁徙图等的option;
		},
		transclude:true,
		templateUrl:function(elem,attrs){
			if(attrs.templateUrl){
				return Common.webRoot()+"/resources/power-ui/plug-directive/template/vanMap/"+attrs.templateUrl;
			}
			return Common.webRoot()+"/resources/power-ui/plug-directive/template/vanMap/vanMap.html";
		},
		controller:function($scope, $http, $timeout, $window, $location,$q){
			var ctrl = this;
			var mapId = powerUtil.UUID();
			$scope.mapId = mapId;
			ctrl.event = {
				regMap:function(){
					var XZQHDM = $scope.xzqhDm || '000000';//默认是全国地图
					this.getMapJson(XZQHDM).then(function(json){
						$scope.mapChart = echarts.init(document.getElementById(mapId));
						var mapname = 'mapName';
						echarts.registerMap(mapname,json);
						var  option = $scope.dataOption || $scope.chart_option();
						for(var i = 0;i<option.series.length;i++){
							option.series[i].map = mapname;
						}
						$scope.mapChart.clear();
						$scope.mapChart.setOption(option);
					})
				},
				getMapJson:function(XZQHDM){
				    var q = $q.defer();
					$.ajax({
						type:'GET',
						url:Common.webRoot()+'/resources/power-ui/plug-directive/template/vanMap/json/'+XZQHDM+'.json',
						data:{},
						dataType:'JSON',
						success:function(json){
							if(json){
								q.resolve(json);								
							}else{
								q.reject('地图数据加载失败');
							}
							
						},
						error:function(err){
							q.reject('地图数据加载失败');
						}
					})
					return q.promise;
				},
				//根据名称匹配XZQHDM
				getXzqhDm:function(name){

				}
			}
			ctrl.event.regMap();
			$scope.$watch("xzqhDm",function(n,o){
				ctrl.event.regMap()
			},true)
			//默认配置option;
			$scope.chart_option = function(mapname){
					var option = {
						title: {
							text: $scope.vanText || "",
							left: 'center'
						},
						tooltip: {
							trigger: 'item'
						},
						legend: {
							orient: 'vertical',
							left: 'left',
							data:[]
						},
						series: [
						{
							type: 'map',
							roam: true,
							label: {
								normal: {
									show: true
								},
								emphasis: {
									show: true
								}
							},
							data:[]
						}
						]
					};
					return option;
				}
		},
		link:function(scope,elem,attr){
			//初始化配置
			scope.ngHeight = scope.ngHeight ? scope.ngHeight : 400+'px';
		}
	}
	

})


