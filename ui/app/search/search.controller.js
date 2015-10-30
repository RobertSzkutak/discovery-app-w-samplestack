/* global MLSearchController */
(function () {
  'use strict';

  angular.module('app.search')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$scope', '$location', 'userService', 'MLSearchFactory', 'MLRest'];

  // inherit from MLSearchController
  var superCtrl = MLSearchController.prototype;
  SearchCtrl.prototype = Object.create(superCtrl);

  function SearchCtrl($scope, $location, userService, searchFactory, mlRest) {
    var ctrl = this;

    ctrl.option = 'all.xml';
    ctrl.options = ['all.xml', 'all2.xml']
    ctrl.initializedGMap = 0;
    ctrl.data = null;
    ctrl.markers = [];
    ctrl.heatData = [];
    ctrl.infowindow = null;
    ctrl.heatmap = null;
    ctrl.markerCluster = null;
    ctrl.toggle = 1;
    ctrl.htoggle = 0;
    ctrl.ctoggle = 0;

    var mlSearch = searchFactory.newContext();

    superCtrl.constructor.call(ctrl, $scope, $location, mlSearch);

    ctrl.init();

    ctrl.initialize = function()
    {
      ctrl.getOptions();
    }

    ctrl.doSearch = function(qtext)
    {
      var mlSearch = searchFactory.newContext({queryOption: ctrl.option});

      ctrl.search({qtext: qtext}).then(
        function(res) {
          console.log("Search Results:");
          console.log(res);
        });
    }

    ctrl.setSnippet = function(type) {
      mlSearch.setSnippet(type);
      ctrl.search();
    };

    ctrl.getOptions = function() {
      mlRest.queryConfig('', '')
        .then(function(res) {
          console.log("Options fetched");
          console.log(res);
          ctrl.options = res.data;
          ctrl.option = ctrl.options[0].name;
        });
    };

    ctrl.setOptions = function(option) {
      ctrl.option = option;
      //mlSearch.setSnippet(type);
      ctrl.search();
    };

    ctrl.showMap = function() {
      //Intialize Map
      if(ctrl.initializedGMap == 0)
      {
        console.log("Attempting to render map...");

        var latlng = new google.maps.LatLng(33.137551, -98.261719);
        var mapOptions = {
          zoom: 3,
          center: latlng
        }

        ctrl.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        ctrl.infowindow = new google.maps.InfoWindow(
        {
          content: 'loading..'
        });

        ctrl.initializedGMap = 1;
      }

      if(ctrl.markers.length > 0)
        ctrl.removeMarkers();

      ctrl.plotPoints();
    };

    ctrl.plotPoints = function() {
      console.log("Inside plotPoints()");
      //console.log(ctrl.response);

      ctrl.response.results.forEach(function(res) {
        var result = res.extracted.content[0];
        //console.log(result);
        if(result.latitude != null && result.latitude != "")
        {
          var location = new google.maps.LatLng(parseFloat(result.latitude), parseFloat(result.longitude));
          var description = result.about;

          var marker = new google.maps.Marker({
            position: location,
            map: ctrl.map,
            html: description
          });

          google.maps.event.addListener(marker, 'click', function ()
          {
            ctrl.infowindow.setContent(this.html);
            ctrl.infowindow.open(ctrl.map, this);
          });

          ctrl.markers.push(marker);

          ctrl.heatData.push(new google.maps.LatLng(parseFloat(result.latitude), parseFloat(result.longitude)));
        }
      });
    };

    ctrl.heatmapOn = function()
    {
      var pointArray = new google.maps.MVCArray(ctrl.heatData);

      ctrl.heatmap = new google.maps.visualization.HeatmapLayer({
                        data: pointArray
      });
      ctrl.heatmap.set('radius', 20);
      ctrl.heatmap.setMap(ctrl.map);
    };

    ctrl.heatmapOff = function()
    {
      if(ctrl.heatmap != null)
        ctrl.heatmap.setMap(null);
    };

    ctrl.clustersOn = function()
    {
      ctrl.markerCluster = new MarkerClusterer(ctrl.map, ctrl.markers);
    };

    ctrl.clustersOff = function()
    {
      ctrl.markerCluster.clearMarkers();
      ctrl.showMap();
    };

    ctrl.removeMarkers = function()
    {
      for (var i = 0; i < ctrl.markers.length; i++)
        ctrl.markers[i].setMap(null);
        ctrl.markers = [];
        ctrl.heatData = [];
        ctrl.heatmapOff();
        ctrl.toggle = 1;
        ctrl.htoggle = 0;
    };

    ctrl.toggleMarkers = function()
    {
      if(ctrl.toggle == 1)
      {
        for (var i = 0; i < ctrl.markers.length; i++)
          ctrl.markers[i].setMap(null);
          ctrl.toggle = 0;
      }
      else if(ctrl.toggle == 0)
      {
        for (var i = 0; i < ctrl.markers.length; i++)
          ctrl.markers[i].setMap(ctrl.map);
          ctrl.toggle = 1;
      }
    };

    ctrl.toggleHeatmap = function()
    {
      if(ctrl.htoggle == 1)
      {
        ctrl.heatmapOff();
        ctrl.htoggle = 0;
      }
      else if(ctrl.htoggle == 0)
      {
        ctrl.heatmapOn();
        ctrl.htoggle = 1;
      }
    };

    ctrl.toggleClusters = function()
    {
      if(ctrl.ctoggle == 1)
      {
        ctrl.clustersOff();
        ctrl.ctoggle = 0;
      }
      else if(ctrl.ctoggle == 0)
      {
        ctrl.clustersOn();
        ctrl.ctoggle = 1;
      }
    };

    ctrl.showCharts = function() {
      ctrl.facetsData = [];
      ctrl.drilldownSeries = [];

      console.log(ctrl.response.facets);

      //Build Highchart Drilldown Pie Chart
      var totalSum = 0;
      angular.forEach(ctrl.response.facets, function(value, key) {
        console.log("Value:");
        console.log(value);
        console.log("Key:");
        console.log(key);
        for (var i = 0; i < value.facetValues.length; i++)
          totalSum += value.facetValues[i].count;
      });
      console.log("Total Sum: " + totalSum);

      angular.forEach(ctrl.response.facets, function(value, key) {
        var sum = 0;
        for (var i = 0; i < value.facetValues.length; i++)
          sum += value.facetValues[i].count;

        if(sum > 0)
        {
          ctrl.facetsData.push({
              name: key,
              y: sum / totalSum * 100,
              drilldown: ctrl.response.facets[key] ? key : null
          });

          //Build drilldown series for this facet series
          var data = [];
          angular.forEach(value.facetValues, function(ddvalue, ddkey) {

            data.push([
                ddvalue.value,
                ddvalue.count / sum * 100
            ]);
          });

          ctrl.drilldownSeries.push({
            id: key,
            name: key,
            point: {
              events: {
                click: function(e) {
                    console.log("Point Clicked on DrilldownSeries Event:")
                    console.log(e.point.series.name+":"+'"'+e.point.name+'"');
                    setTimeout(function(){
                        //location.href =
                        //  location.href.substring(0, location.href.indexOf("/?")+1) + "fieldintel/" +
                        //  location.href.substring(location.href.indexOf("/?")+1, location.href.length) +
                        //  "&q=" + e.point.series.name+":"+'"'+e.point.name+'"';
                    }, 500)
                    e.preventDefault();
                }
              }
            },
            data: data
          });
        }
      });

      console.log("facetsData: ");
      console.log(ctrl.facetsData);

      console.log("drilldownSeries: ");
      console.log(ctrl.drilldownSeries);

      // Create the chart
      $('#facetsContainer').highcharts({
        chart: {
          type: 'pie'
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        plotOptions: {
          series: {
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.y:.3f}%'
            }
          }
        },

        tooltip: {
          headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
          pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },

        series: [{
          name: 'Facets',
          colorByPoint: true,
          data: ctrl.facetsData
        }],

        drilldown: {
          series: ctrl.drilldownSeries
        }
      });
    };

    //This is an entry point to do initialization
    ctrl.initialize();

    $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });
  }
}());
