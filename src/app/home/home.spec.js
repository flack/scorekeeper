describe( 'home section', function() {
    let $controller;

    beforeEach( angular.mock.module( 'ngScorekeeper.home' ) );

    beforeEach( angular.mock.inject( function( _$controller_ ) {
        $controller = _$controller_;
    }));

    function createController( online ) {
        const scope = {};
        $controller( 'HomeCtrl', { $scope: scope, $window: { navigator: { onLine: online } } } );
        return scope;
    }

    it( 'should show the social buttons when online', function() {
        expect( createController( true ).show_social() ).toBe( 'home/social.tpl.html' );
    });

    it( 'should hide the social buttons when offline', function() {
        expect( createController( false ).show_social() ).toBeNull();
    });
});
