angular
    .module('ulbBookReport', [])
    .controller('MainCtrl', function($scope, $http) {
        $http
            .get('books.json')
            .then(function(books) {
                if(!books) throw new Error('NO_BOOKS.JSON');

                $scope.books = books.data;
            });
    });