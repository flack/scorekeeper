angular.module( 'ngScorekeeper.scores', [
    'ui.router',
    'angularMoment',
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

.controller( 'ScoresCtrl', function HomeController( $scope, $localStorage ) {
    $scope.default_title = 'Untitled Game';
    $scope.$storage = $localStorage.$default(
    {
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

    $scope.start = function()
    {
        reset_totals();
        $scope.$storage.rows = [];
        $scope.$storage.finished = null;
        $scope.$storage.started = new Date();
        $scope.winners = [];
        $scope.new_row();
        $scope.running = true;
    };

    $scope.resume = function()
    {
        $scope.$storage.games.shift();
        $scope.$storage.finished = null;
        $scope.winners = [];
        $scope.running = true;
        $scope.new_row();
    };

    $scope.abort = function()
    {
        reset_totals();
        $scope.$storage.started = null;
        $scope.$storage.finished = null;
        $scope.$storage.rows = [];
        $scope.running = false;
    };

    $scope.finish = function()
    {
        $scope.$storage.finished = new Date();
        $scope.running = false;
        var game =
            {
                title: angular.copy($scope.$storage.title),
                started: angular.copy($scope.$storage.started),
                finished: angular.copy($scope.$storage.finished),
                players: angular.copy($scope.$storage.players),
                totals: angular.copy($scope.totals)
            };
        $scope.$storage.games.unshift(game);

        while ($scope.$storage.rows.length > 0 && is_row_empty(angular.copy($scope.$storage.rows[$scope.$storage.rows.length - 1])))
        {
            $scope.$storage.rows.pop();
        }

        render_result();
    };

    $scope.new_row = function()
    {
        var row = {};
        for (var i in $scope.$storage.players)
        {
            row[$scope.$storage.players[i].id] = '';
        }

        $scope.$storage.rows.push(row);
        $scope.focus_input = true;
    };

    $scope.update_totals = function(player_id)
    {
        var player_total = 0,
            score = 0;
        for (var i in $scope.$storage.rows)
        {
            player_total += parse_score($scope.$storage.rows[i][player_id]);
        }
        $scope.totals[player_id] = player_total;
    };

    $scope.is_max = function(score, row)
    {
        //copy to get rid of $$hashKey
        var copy = angular.copy(row),
            i;
        if (is_row_empty(copy))
        {
            return false;
        }
        for (i in copy)
        {
            if (parse_score(copy[i]) > parse_score(score))
            {
                return false;
            }
        }
        return true;
    };

    function is_row_empty(row)
    {
        for (var i in row)
        {
            if (parse_score(row[i]) !== 0)
            {
                return false;
            }
        }
        return true;
    }

    function parse_score(score)
    {
        if (score === '')
        {
            return 0;
        }
        if (typeof score === 'string')
        {
            score = score.replace(/,/, '.');
        }
        if (!isNaN(score))
        {
            return parseFloat(score, 10);
        }
        return 0;
    }

    function init()
    {
        if ($scope.$storage.rows.length > 0)
        {
            for (var i in $scope.$storage.players)
            {
                $scope.update_totals($scope.$storage.players[i].id);
            }
        }
        if ($scope.$storage.started && !$scope.$storage.finished)
        {
            $scope.running = true;
        }
    }

    function reset_totals()
    {
        for (var i in $scope.$storage.players)
        {
            $scope.totals[$scope.$storage.players[i].id] = 0;
        }
    }

    function render_result()
    {
        var highscore = 0,
            winners = [];
        for (var i in $scope.$storage.players)
        {
            if ($scope.totals[$scope.$storage.players[i].id] > highscore)
            {
                highscore = $scope.totals[$scope.$storage.players[i].id];
                winners = [$scope.$storage.players[i].id];
            }
            else if ($scope.totals[$scope.$storage.players[i].id] === highscore)
            {
                winners.push($scope.$storage.players[i].id);
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
            element.on('focus, click', function () {
                this.select();
            });
        }
    };
})
.directive('focusMe', function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if (value === true) {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
      element.bind('blur', function() {
          if (model.assign)
          {
              scope.$apply(model.assign(scope, false));
          }
      });
    }
  };
})
.directive('contenteditable', ['$localStorage', function($localStorage) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
          if (!ngModel)
          {
              return;
          }

          ngModel.$render = function() {
              if (element.text() !== ngModel.$viewValue)
              {
                  element.text(ngModel.$viewValue || scope.default_title);
              }
          };

          element.on('blur', function() {
              scope.$apply(read);
          });
          ngModel.$render();

          function read() {
              var title = $.trim(element.text());
              title = title.replace(/<br>/g, '');
              if (title === '')
              {
                  title = scope.default_title;
              }
              ngModel.$setViewValue(title);
              ngModel.$render();
          }
      }
    };
}])
.filter('playername', ['$localStorage', function($localStorage)
{
    return function (input)
    {
        for (var i in $localStorage.players)
        {
            if ($localStorage.players[i].id === input)
            {
                return $localStorage.players[i].name;
            }
        }
        return input + ' not found';
    };
}])
.filter('playernames', ['$localStorage', function($localStorage)
{
    return function (input)
    {
        var names = [],
            i;
        for (i in $localStorage.players)
        {
            if (input.indexOf($localStorage.players[i].id) !== -1)
            {
                names.push($localStorage.players[i].name);
            }
        }
        return names.join(', ');
    };
}]);
