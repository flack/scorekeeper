angular.module( 'ngScorekeeper.players', [
    'ui.router',
    'ui.sortable',
    'ngStorage'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'players', {
    url: '/players',
    views: {
      "main": {
        controller: 'PlayersCtrl',
        templateUrl: 'players/players.tpl.html'
      }
    },
    data:{ pageTitle: 'Manage Players' }
  });
})

.controller( 'PlayersCtrl', function PlayersController( $scope, $localStorage ) {
    $scope.$storage = $localStorage.$default({players: []});
    $scope.player = {};

    $scope.add_player = function(player)
    {
        player.id = 'player' + $scope.$storage.players.length;
        $scope.$storage.players.push(angular.copy(player));
        $scope.player.name = '';
        if ($scope.addPlayer)
        {
            $scope.addPlayer.$setPristine();
        }
    };

    $scope.update = function(player)
    {
        $scope.$storage.players[player.id].name = player.name;
    };

    $scope.remove_player = function(player)
    {
        for (var i in $scope.$storage.players)
        {
            if ($scope.$storage.players[i].id === player.id)
            {
                $scope.$storage.players.splice(i, 1);
                break;
            }
        }
    };

});
