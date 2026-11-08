describe( 'AppCtrl', function() {
    var $scope, $state, $rootScope;

    beforeEach( function() {
        window.localStorage.clear();
    });

    beforeEach( angular.mock.module( 'ngScorekeeper' ) );

    beforeEach( angular.mock.inject( function( $controller, _$rootScope_, _$state_, $templateCache ) {
        $rootScope = _$rootScope_;
        $state = _$state_;
        // The test setup stubs out html2js' templates, so give the states something to render
        [ 'home/home.tpl.html', 'players/players.tpl.html', 'scores/scores.tpl.html', 'games/games.tpl.html' ].forEach( function( url ) {
            $templateCache.put( url, '<div></div>' );
        });
        $scope = $rootScope.$new();
        $controller( 'AppCtrl', { $scope: $scope } );
    }));

    function go( state ) {
        $state.go( state );
        $rootScope.$digest();
    }

    it( 'should use the plain app name as title on the home page', function() {
        go( 'home' );
        expect( $scope.pageTitle ).toBe( 'scorekeeper' );
    });

    it( 'should prefix the title with the page title of the current state', function() {
        go( 'players' );
        expect( $scope.pageTitle ).toBe( 'Manage Players | scorekeeper' );
        go( 'scores' );
        expect( $scope.pageTitle ).toBe( 'Scores | scorekeeper' );
        go( 'games' );
        expect( $scope.pageTitle ).toBe( 'Games | scorekeeper' );
    });

    it( 'should fall back to the home page for unknown urls', angular.mock.inject( function( $location ) {
        $location.url( '/does-not-exist' );
        $rootScope.$digest();
        expect( $state.current.name ).toBe( 'home' );
    }));
});
