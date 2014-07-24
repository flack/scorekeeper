angular.module( 'ngScorekeeper.home', [
  'ui.router'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

.controller( 'HomeCtrl', function HomeController( $scope , $window) {
    $scope.isonline = $window.navigator.onLine;

    $scope.show_social = function()
    {
        if ($window.navigator.onLine)
        {
            return 'home/social.tpl.html';
        }
        return null;
    };
});
