describe( 'AppCtrl', function() {
  describe( 'isCurrentUrl', function() {
    var AppCtrl, $location, $scope, $transitions;

    beforeEach( module( 'ngScorekeeper' ) );

    beforeEach( inject( function( $controller, _$location_, $rootScope, _$transitions_ ) {
      $location = _$location_;
      $transitions = _$transitions_;
      $scope = $rootScope.$new();
      AppCtrl = $controller( 'AppCtrl', { $location: $location, $scope: $scope, $transitions: $transitions });
    }));

    it( 'should pass a dummy test', inject( function() {
      expect( AppCtrl ).toBeTruthy();
    }));
  });
});
