define(['app/module'], function (module) {
  'use strict';
  module
    .factory('ServerConfig', ['$http', '$q', function($http, $q) {
      var serverConfig = {};
      var databasePropertiesPromise;
      serverConfig.get = function() {
        var config = {},
            defered = [],
            configItems = {
              databaseName: 'getDatabaseName',
              chartData: 'getCharts',
              searchOptions: 'getSearchOptions',
              fields: 'getFields',
              rangeIndexes: 'getRangeIndexes',
              geospatialIndexes: 'getGeospatialIndexes',
              defaultSource: 'getSuggestionSource',
              uiConfig: 'getUiConfig',
              databases: 'getDatabases'
            },
            defaults = {
              databaseName: 'Documents',
              chartData: {charts: []},
              searchOptions: {option: {constraint: []}},
              fields: {'field-list': []},
              rangeIndexes: {'range-index-list': []},
              geospatialIndexes: {'geospatial-index-list': []},
              defaultSource: "",
              uiConfig: {},
              databases: []
            };
        angular.forEach(configItems, function() {
          defered.push($q.defer());
        });
        var promises = _.map(defered, function(d) { return d.promise; });
        if (databasePropertiesPromise) {
          databasePropertiesPromise = null;
        } 
        var recursiveRun = function(keys, index) {
          if (index < keys.length) {
            var d = defered[index],
              key = keys[index],
              value = configItems[key];
            serverConfig[value](true).then(function(result) {
              config[key] = result || defaults[key];
              recursiveRun(keys, index + 1);
              d.resolve(result);
            }, d.reject);
          }
        };

        recursiveRun(Object.keys(configItems), 0);

        return $q.all(promises).then(function() { return config; });
      };

      serverConfig.getDatabaseProperties = function(cache) {
        if (!(databasePropertiesPromise && cache)) {
          databasePropertiesPromise = $http.get('/server/database/properties')
          .then(function(response){
            return response.data;
          });
        }
        return databasePropertiesPromise;
      };

      serverConfig.getCharts = function() {
        return $http.get('/server/charts')
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.setCharts = function(charts) {
        return $http.put('/server/charts', charts)
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.getDatabaseName = function(cache) {
        return serverConfig.getDatabaseProperties(cache).then(
            function(dbProperties) {
              return dbProperties['database-name'];
            }
          );
      };

      serverConfig.getFields = function(cache) {
        return serverConfig.getDatabaseProperties(cache).then(
            function(dbProperties) {
              var fieldList = [];
              angular.forEach(dbProperties.field, function(field){
                if (field['field-name'] && field['field-name'] != '') {
                  fieldList.push(field);
                }
              });
              return {
                'field-list': fieldList
              };
            }
          );
      };

      serverConfig.setFields = function(rangeIndexes) {
        return $http.put('/server/database/fields', rangeIndexes)
          .then(function(response){
            return response.data;
          });
      };

      var geospatialIndexTypes = ['geospatial-element-index','geospatial-element-pair-index'];
      serverConfig.getGeospatialIndexes = function(cache) {
        return serverConfig.getDatabaseProperties(cache).then(
            function(dbProperties) {
              var rangeIndexes = [];
              angular.forEach(geospatialIndexTypes, function(indexType){
                angular.forEach(dbProperties[indexType], function(index) {
                  var modIndex = {};
                  modIndex[indexType] = index;
                  rangeIndexes.push(modIndex);
                });
              });
              return {
                'geospatial-index-list': rangeIndexes
              };
            }
          );
      };

      serverConfig.setGeospatialIndexes = function(geospatialIndexes) {
        return $http.put('/server/database/geospatial-indexes', geospatialIndexes)
          .then(function(response){
            return response.data;
          });
      };

      var rangeIndexTypes = ['range-element-index','range-element-attribute-index', 'range-path-index', 'range-field-index'];
      serverConfig.getRangeIndexes = function(cache) {
        return serverConfig.getDatabaseProperties(cache).then(
            function(dbProperties) {
              var rangeIndexes = [];
              angular.forEach(rangeIndexTypes, function(indexType){
                angular.forEach(dbProperties[indexType], function(index) {
                  var modIndex = {};
                  modIndex[indexType] = index;
                  rangeIndexes.push(modIndex);
                });
              });
              return {
                'range-index-list': rangeIndexes
              };
            }
          );
      };

      serverConfig.setRangeIndexes = function(rangeIndexes) {
        return $http.put('/server/database/range-indexes', rangeIndexes)
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.getSearchOptions = function() {
        return $http.get('/server/search-options')
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.setSearchOptions = function(searchOptions) {
        return $http.put('/server/search-options', searchOptions)
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.find = function(localname, type) {
        return $http.get('/server/database/content-metadata', {params: {localname: localname, type:type}})
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.loadData = function(directory) {
        return $http.get('/server/database/load-data', {params: {directory: directory}})
          .then(function(response){
            return response.data;
          });
      };
      serverConfig.getSuggestionSource = function() {
        return $http.get('/server/database/defaultsource')
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.setSuggestionSource = function(defaultsource) {
        return $http.put('/server/database/defaultsource', defaultsource)
          .then(function(response){
            return response.data;
          });
      };
      
      serverConfig.getUiConfig = function() {
        return $http.get('/server/ui_config')
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.setUiConfig = function(uiConfig) {
        return $http.put('/server/ui_config', uiConfig)
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.getDatabases = function() {
        return $http.get('/server/databases')
          .then(function(response){
            return  _.map(response.data['database-default-list']['list-items']['list-item'], 
                function(db){ 
                  return db.nameref;
                });
          });
      }

      serverConfig.setDatabase = function(dbConfig) {
        return $http.put('/server/database', dbConfig)
          .then(function(response){
            return response.data;
          });
      }

      serverConfig.removeDataCollection = function(collection) {
        return $http.delete('/server/database/collection/'+collection)
          .then(function(response){
            return response;
          });
      };

      serverConfig.dataTypes = function() {
        return [
          'int',
          'unsignedInt',
          'long',
          'unsignedLong',
          'float',
          'double',
          'decimal' ,
          'dateTime',
          'time',
          'date',
          'gYearMonth',
          'gYear',
          'gMonth',
          'gDay',
          'yearMonthDuration',
          'dayTimeDuration',
          'string',
          'anyURI'
        ];
      };

      return serverConfig;
    }]);
});
