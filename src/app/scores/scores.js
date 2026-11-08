angular.module( 'ngScorekeeper.scores', [
    'ui.router',
    'angularMoment',
    'ui.bootstrap',
    'ngStorage'
])

.config(function config( $stateProvider ) {
    $stateProvider.state( 'scores', {
        url: '/scores',
        views: {
            "main": {
                controller: 'ScoresCtrl',
                templateUrl: 'scores/scores.tpl.html'
            }
        },
        data:{ pageTitle: 'Scores' }
    });
})

.controller( 'ScoresCtrl', function ScoresController( $scope, $localStorage ) {
    $scope.default_title = 'Untitled Game';
    $scope.$storage = $localStorage.$default({
        games: [],
        players: [],
        title: $scope.default_title,
        rows: [],
        started: null,
        finished: null
    });
    $scope.totals = {};
    $scope.focus_input = false;
    $scope.winners = [];
    $scope.running = false;

    $scope.start = function() {
        reset_totals();
        $scope.$storage.rows = [];
        $scope.$storage.finished = null;
        $scope.$storage.started = new Date();
        $scope.winners = [];
        $scope.new_row();
        $scope.running = true;
    };

    $scope.resume = function() {
        $scope.$storage.games.shift();
        $scope.$storage.finished = null;
        $scope.winners = [];
        $scope.running = true;
        $scope.new_row();
    };

    $scope.abort = function() {
        reset_totals();
        $scope.$storage.started = null;
        $scope.$storage.finished = null;
        $scope.$storage.rows = [];
        $scope.running = false;
    };

    $scope.finish = function() {
        $scope.$storage.finished = new Date();
        $scope.running = false;
        const game = {
            title: angular.copy($scope.$storage.title),
            started: angular.copy($scope.$storage.started),
            finished: angular.copy($scope.$storage.finished),
            players: angular.copy($scope.$storage.players),
            totals: angular.copy($scope.totals)
        };
        $scope.$storage.games.unshift(game);

        while ($scope.$storage.rows.length > 0 && is_row_empty(angular.copy($scope.$storage.rows[$scope.$storage.rows.length - 1]))) {
            $scope.$storage.rows.pop();
        }

        render_result();
    };

    $scope.new_row = function() {
        const row = {};
        for (const player of $scope.$storage.players) {
            row[player.id] = '';
        }

        $scope.$storage.rows.push(row);
        $scope.focus_input = true;
    };

    $scope.update_totals = function(player_id) {
        $scope.totals[player_id] = $scope.$storage.rows.reduce((total, row) => total + parse_score(row[player_id]), 0);
    };

    $scope.is_max = function(score, row) {
        //copy to get rid of $$hashKey
        const copy = angular.copy(row);
        if (is_row_empty(copy)) {
            return false;
        }
        return !Object.values(copy).some(value => parse_score(value) > parse_score(score));
    };

    function is_row_empty(row) {
        return Object.values(row).every(value => parse_score(value) === 0);
    }

    // Accepts numbers and numeric strings (with ',' or '.' as decimal
    // separator); anything else, including empty input, counts as 0
    function parse_score(score) {
        const value = Number(String(score).trim().replace(',', '.'));
        return Number.isFinite(value) ? value : 0;
    }

    function init() {
        if ($scope.$storage.rows.length > 0) {
            for (const player of $scope.$storage.players) {
                $scope.update_totals(player.id);
            }
        }
        if ($scope.$storage.started && !$scope.$storage.finished) {
            $scope.running = true;
        }
    }

    function reset_totals() {
        for (const player of $scope.$storage.players) {
            $scope.totals[player.id] = 0;
        }
    }

    function render_result() {
        let highscore = -Infinity;
        let winners = [];
        for (const {id} of $scope.$storage.players) {
            if ($scope.totals[id] > highscore) {
                highscore = $scope.totals[id];
                winners = [id];
            } else if ($scope.totals[id] === highscore) {
                winners.push(id);
            }
        }
        $scope.winners = winners;
    }

    init();
})

.directive('selectOnFocus', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('focus click', function () {
                this.select();
            });
        }
    };
})
.directive('focusMe', function($timeout, $parse) {
    return {
        link: function(scope, element, attrs) {
            const model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                if (value === true) {
                    $timeout(function() {
                        element[0].focus();
                    });
                }
            });
            element.on('blur', function() {
                if (model.assign) {
                    scope.$apply(model.assign(scope, false));
                }
            });
        }
    };
})
.directive('contenteditable', function() {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            ngModel.$render = function() {
                if (element.text() !== ngModel.$viewValue) {
                    element.text(ngModel.$viewValue || scope.default_title);
                }
            };

            element.on('blur', function() {
                scope.$apply(read);
            });
            ngModel.$render();

            function read() {
                let title = element.text().trim();
                title = title.replace(/<br>/g, '');
                if (title === '') {
                    title = scope.default_title;
                }
                ngModel.$setViewValue(title);
                ngModel.$render();
            }
        }
    };
})
.filter('playername', ['$localStorage', function($localStorage) {
    return function (input) {
        const player = ($localStorage.players || []).find(candidate => candidate.id === input);
        return player ? player.name : input + ' not found';
    };
}])
.filter('playernames', ['$localStorage', function($localStorage) {
    return function (input) {
        return ($localStorage.players || [])
            .filter(player => input.includes(player.id))
            .map(player => player.name)
            .join(', ');
    };
}]);
