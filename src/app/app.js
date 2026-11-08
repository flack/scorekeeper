angular.module( 'ngScorekeeper', [
    'templates-app',
    'ngScorekeeper.home',
    'ngScorekeeper.players',
    'ngScorekeeper.scores',
    'ngScorekeeper.games',
    'ngScorekeeper.animations',
    'ui.bootstrap',
    'ui.router'
])

.config( function myAppConfig ( $urlRouterProvider ) {
    $urlRouterProvider.otherwise( '/home' );
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $transitions ) {
      $transitions.onSuccess({}, function($transition) {
          if ($transition.to().name !== 'home') {
              $scope.pageTitle = $transition.to().data.pageTitle + ' | scorekeeper';
          } else {
              $scope.pageTitle = 'scorekeeper';
          }
      });
});
