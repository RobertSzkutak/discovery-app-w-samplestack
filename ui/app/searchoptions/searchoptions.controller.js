(function () {
  'use strict';

  angular.module('app.searchoptions')
    .controller('SearchoptionsCtrl', SearchoptionsCtrl);

  SearchoptionsCtrl.$inject = ['$scope', 'MLRest', '$state', 'userService'];

  function SearchoptionsCtrl($scope, mlRest, $state, userService) {
    var ctrl = this;

    var defaultxml = '<options xmlns="http://marklogic.com/appservices/search">\
            <return-results>true</return-results>\
            <return-facets>true</return-facets>\
            <debug>false</debug>\
            <!--\
                <constraint name="sample-facet">\
                  <range type="xs:string" facet="true">\
                    <element ns="" name="elementname"/>\
                    <facet-option>frequency-order</facet-option>\
                    <facet-option>descending</facet-option>\
                  </range>\
                </constraint>\
            -->\
           </options>'

    angular.extend(ctrl, {
      options: {
        name: null,
        options: defaultxml
      },
      newTag: null,
      currentUser: null,
      editorOptions: {
        plugins : 'advlist autolink link image lists charmap print preview',
        encoding: 'xml'
      },
      submit: submit,
      addTag: addTag,
      removeTag: removeTag
    });

    function submit() {
      mlRest.createDocument(ctrl.options.options, {
        format: 'xml',
        directory: '/options/',
        //extension: '.xml',
        filename: $scope.ctrl.options.name + '.xml',
        collection: ['options']
        // TODO: add read/update permissions here like this:
        // 'perm:sample-role': 'read',
        // 'perm:sample-role': 'update'
      }).then(function(response) {
        $state.go('root.view', { uri: response.replace(/(.*\?uri=)/, '') });
      });
    }

    function addTag() {
      if (ctrl.newTag && ctrl.newTag !== '' && ctrl.person.tags.indexOf(ctrl.newTag) < 0) {
        ctrl.person.tags.push(ctrl.newTag);
      }
      ctrl.newTag = null;
    }

    function removeTag(index) {
      ctrl.person.tags.splice(index, 1);
    }

    $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });
  }
}());
