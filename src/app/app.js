angular.module( 'ngScorekeeper', [
    'templates-app',
    'templates-common',
    'ngScorekeeper.home',
    'ngScorekeeper.players',
    'ngScorekeeper.scores',
    'ngScorekeeper.games',
    'ngScorekeeper.animations',
    'ui.bootstrap',
    'ui.router'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | scorekeeper' ;
    }
  });
})

;
