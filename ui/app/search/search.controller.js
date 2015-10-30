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
                            console.log("Attempting to render map...")
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
    };

    ctrl.showCharts = function() {
                      $scope.model.facetsData = [];
                      $scope.model.drilldownSeries = [];

                      console.log($scope.model.search);

                      //Build Highchart Drilldown Pie Chart
                      var totalSum = 0;
                      angular.forEach($scope.model.search.facets, function(value, key) {
                          for (var i = 0; i < value.length; i++)
                              totalSum += value[i].count;
                      });
                      console.log("Total Sum: " + totalSum);

                      angular.forEach($scope.model.search.facets, function(value, key) {
                          var sum = 0;
                          for (var i = 0; i < value.length; i++)
                              sum += value[i].count;

                          if(sum > 0)
                          {
                              $scope.model.facetsData.push({
                                      name: key,
                                      y: sum / totalSum * 100,
                                      drilldown: $scope.model.search.facets[key] ? key : null
                              });

                              //Build drilldown series for this facet series
                              var data = [];
                              angular.forEach(value, function(ddvalue, ddkey) {

                                  data.push([
                                      ddvalue.value,
                                      ddvalue.count / sum * 100
                                  ]);
                              });

                              $scope.model.drilldownSeries.push({
                                  id: key,
                                  name: key,
                                  point: {
                                    events: {
                                      click: function(e) {
                                         console.log("Point Clicked on DrilldownSeries Event:")
                                         console.log(e.point.series.name+":"+'"'+e.point.name+'"');
                                         setTimeout(function(){
                                             location.href =
                                              location.href.substring(0, location.href.indexOf("/?")+1) + "fieldintel/" +
                                              location.href.substring(location.href.indexOf("/?")+1, location.href.length) +
                                              "&q=" + e.point.series.name+":"+'"'+e.point.name+'"';
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
                      console.log($scope.model.facetsData);

                      console.log("drilldownSeries: ");
                      console.log($scope.model.drilldownSeries);

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
                              data: $scope.model.facetsData
                          }],
                          drilldown: {
                              series: $scope.model.drilldownSeries
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
