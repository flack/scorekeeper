describe( 'scores section', function() {
    beforeEach( module( 'ngScorekeeper.scores' ) );

    beforeEach(inject(function($controller) {
        scope = {};
        ctrl = $controller('ScoresCtrl', {$scope:scope});
    }));

  it( 'should update totals', function() {
      scope.$storage.players.push({'id': 'player1', 'name': 'Player 1'});
      scope.totals.player1 = 0;
      scope.$storage.rows.push({player1: 4});
      scope.update_totals('player1');
      expect( scope.totals.player1 ).toBe(4);
  });
  it( 'should cope with empty inputs', function() {
      scope.$storage.players.push({'id': 'player1', 'name': 'Player 1'});
      scope.totals.player1 = 0;
      scope.$storage.rows.push({player1: ''});
      scope.$storage.rows.push({player1: 4});
      scope.update_totals('player1');
      expect( scope.totals.player1 ).toBe(4);
  });

  it( 'should ignore invalid input', function() {
      scope.$storage.players.push({'id': 'player1', 'name': 'Player 1'});
      scope.totals.player1 = 0;
      scope.$storage.rows.push({player1: 4});
      scope.$storage.rows.push({player1: 'x'});
      scope.update_totals('player1');
      expect( scope.totals.player1 ).toBe(4);
  });

  it( 'should find the maximum in row', function() {
      scope.$storage.players.push({'id': 'player1', 'name': 'Player 1'});
      var row = {player1: '4', player2: '3.5'};
      expect( scope.is_max('4', row) ).toBeTruthy();
      expect( scope.is_max('2', row) ).toBeFalsy();
      expect( scope.is_max('', row) ).toBeFalsy();
  });
});
