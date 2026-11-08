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

    // Ids must never be reused: score rows are keyed by player id, so a new
    // player must not take the id of a removed one that still has scores in
    // the current game
    function next_player_id() {
        let highest = -1;

        function check(id) {
            const match = /^player(\d+)$/.exec(id);
            if (match) {
                highest = Math.max(highest, parseInt(match[1], 10));
            }
        }

        angular.forEach($scope.$storage.players, function(existing) {
            check(existing.id);
        });
        angular.forEach($localStorage.rows, function(row) {
            angular.forEach(row, function(score, id) {
                check(id);
            });
        });

        return 'player' + (highest + 1);
    }

    $scope.add_player = function(player) {
        player.id = next_player_id();
        $scope.$storage.players.push(angular.copy(player));
        $scope.player.name = '';
        if ($scope.addPlayer) {
            $scope.addPlayer.$setPristine();
        }
    };

    $scope.remove_player = function(player) {
        const index = $scope.$storage.players.findIndex(existing => existing.id === player.id);
        if (index !== -1) {
            $scope.$storage.players.splice(index, 1);
        }
    };

});
