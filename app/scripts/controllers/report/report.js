'use strict';

app.controller('ReportNewCtrl', function($scope, $routeParams, ReportNewService, MovimentoService, VisioService, JsonService) {

    var index = 0;
    var registers = [];
    var visio = {};
    $scope.link = [];
    $scope.page = [];
    $scope.visio = {};

    var createReport = function() {
        getData();
    }

    var getData = function() {
        MovimentoService.movimento()
            .then(function(data) {
                registers = data;
                getVisio();
            })
            .catch(function(err) {
                data = [];
            });
    }

    var getVisio = function() {
        // VisioService.service.getByHashid($routeParams.hashid)
        JsonService.visioTest()
            .then(function(data) {
                visio = data[0]; 
                getLinks();                
                getPages();
            })
            .catch(function(err) {
                layout = [];
            });
    }

    var getLinks = function() { 
        $scope.link = ReportNewService.links(registers, visio);
        $scope.getLink($scope.link.selected[0], index);
        console.log('links', $scope.link);        
    }

    $scope.getLink = function(key, index) {
        $scope.link = ReportNewService.link(key, index);
    }

    var getPages = function() {
        // $scope.visio = angular.copy(visio);
        var filters = $scope.link.links[0].key;
        _.map($scope.link.selected, function(item) {
            _.extend(filters, item);
        });
        $scope.page = ReportNewService.pages(registers, visio, filters);
        $scope.getPage($scope.page.pages, filters);
    }

    $scope.getPage = function(page) {
        $scope.visio = ReportNewService.page(visio, page);
        console.log('visio', $scope.visio);        
    }

    createReport();

});

