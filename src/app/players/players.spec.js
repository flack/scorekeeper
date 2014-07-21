describe( 'players section', function() {
    beforeEach( module( 'ngScorekeeper.players' ) );

    beforeEach(inject(function($controller) {
        scope = {};
        ctrl = $controller('PlayersCtrl', {$scope:scope});
    }));

  it( 'should add a player', function() {
      scope.$storage.players = [];
      scope.add_player({name: 'ted'});
      expect( scope.$storage.players[0].name ).toBe('ted');
      expect( scope.$storage.players[0].id ).toBe('player0');
  });
});
