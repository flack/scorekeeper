angular.module( 'ngScorekeeper.games', [
    'ui.router',
    'angularMoment',
    'ngStorage'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'games', {
    url: '/games',
    views: {
      "main": {
        controller: 'GamesCtrl',
        templateUrl: 'games/games.tpl.html'
      }
    },
    data:{ pageTitle: 'Games' }
  });
})

.controller( 'GamesCtrl', ['$scope', '$uibModal', '$localStorage', function ( $scope, $modal, $localStorage ) {
    $scope.$storage = $localStorage.$default({games: []});
    $scope.open = function (index)
    {
        var modalInstance = $modal.open({
            templateUrl: 'confirm_delete.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                selected: function () {
                    return index;
                },
                games: function () {
                    return $scope.$storage.games;
                }
            }
        });

        modalInstance.result.then(function (index) {
            $scope.$storage.games.splice(index, 1);
        }, function () {
            //@todo: Display message?
        });
    };
}])
.controller( 'ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'selected', 'games', function ($scope, $modalInstance, selected, games) {
    $scope.game = games[selected];

    $scope.ok = function () {
        $modalInstance.close(selected);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
