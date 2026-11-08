describe( 'players section', function() {
    var scope;

    beforeEach( function() {
        window.localStorage.clear();
    });

    beforeEach( angular.mock.module( 'ngScorekeeper.players' ) );

    beforeEach( angular.mock.inject( function( $controller ) {
        scope = {};
        $controller( 'PlayersCtrl', { $scope: scope } );
    }));

    it( 'should start without players', function() {
        expect( scope.$storage.players ).toEqual( [] );
    });

    it( 'should add a player', function() {
        scope.add_player( { name: 'ted' } );
        expect( scope.$storage.players[0].name ).toBe( 'ted' );
        expect( scope.$storage.players[0].id ).toBe( 'player0' );
    });

    it( 'should number new players consecutively', function() {
        scope.add_player( { name: 'Ann' } );
        scope.add_player( { name: 'Bob' } );
        expect( scope.$storage.players ).toEqual( [ { id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' } ] );
    });

    it( 'should store a copy of the form model and clear the form', function() {
        scope.addPlayer = { $setPristine: vi.fn() };
        scope.player.name = 'Ann';
        scope.add_player( scope.player );
        expect( scope.$storage.players[0] ).not.toBe( scope.player );
        expect( scope.$storage.players[0].name ).toBe( 'Ann' );
        expect( scope.player.name ).toBe( '' );
        expect( scope.addPlayer.$setPristine ).toHaveBeenCalled();
    });

    it( 'should remove a player', function() {
        scope.add_player( { name: 'Ann' } );
        scope.add_player( { name: 'Bob' } );
        scope.add_player( { name: 'Cid' } );
        scope.remove_player( { id: 'player1' } );
        expect( scope.$storage.players ).toEqual( [ { id: 'player0', name: 'Ann' }, { id: 'player2', name: 'Cid' } ] );
    });

    it( 'should not reuse an id after a player was removed', function() {
        scope.add_player( { name: 'Ann' } );
        scope.add_player( { name: 'Bob' } );
        scope.remove_player( { id: 'player0' } );
        scope.add_player( { name: 'Cid' } );
        expect( scope.$storage.players ).toEqual( [ { id: 'player1', name: 'Bob' }, { id: 'player2', name: 'Cid' } ] );
    });

    it( 'should not reuse the id of a removed player that still has scores in the current game', angular.mock.inject( function( $localStorage ) {
        scope.add_player( { name: 'Ann' } );
        scope.add_player( { name: 'Bob' } );
        $localStorage.rows = [ { player0: '3', player1: '5' } ];
        scope.remove_player( { id: 'player1' } );
        scope.add_player( { name: 'Cid' } );
        expect( scope.$storage.players[1] ).toEqual( { id: 'player2', name: 'Cid' } );
    }));

    it( 'should continue after the highest stored id', function() {
        scope.$storage.players = [ { id: 'player4', name: 'Ann' }, { id: 'player2', name: 'Bob' } ];
        scope.add_player( { name: 'Cid' } );
        expect( scope.$storage.players[2].id ).toBe( 'player5' );
    });

    it( 'should ignore keys that are not player ids', angular.mock.inject( function( $localStorage ) {
        $localStorage.rows = [ { $$hashKey: 'object:7', player0: '' } ];
        scope.add_player( { name: 'Ann' } );
        expect( scope.$storage.players[0].id ).toBe( 'player1' );
    }));

    it( 'should ignore removing an unknown player', function() {
        scope.add_player( { name: 'Ann' } );
        scope.remove_player( { id: 'player9' } );
        expect( scope.$storage.players.length ).toBe( 1 );
    });
});
