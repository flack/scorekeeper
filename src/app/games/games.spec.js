describe( 'games section', function() {
    let $controller, $q, $rootScope;

    beforeEach( function() {
        window.localStorage.clear();
    });

    beforeEach( angular.mock.module( 'ngScorekeeper.games' ) );

    beforeEach( angular.mock.inject( function( _$controller_, _$q_, _$rootScope_ ) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    describe( 'GamesCtrl', function() {
        let scope, $uibModal, modalResult;

        beforeEach( function() {
            modalResult = $q.defer();
            $uibModal = { open: vi.fn( function() { return { result: modalResult.promise }; } ) };
            scope = {};
            $controller( 'GamesCtrl', { $scope: scope, $uibModal: $uibModal } );
            scope.$storage.games = [ { title: 'First' }, { title: 'Second' }, { title: 'Third' } ];
        });

        it( 'should open the confirmation dialog for the selected game', function() {
            scope.open( 1 );
            const options = $uibModal.open.mock.calls[0][0];
            expect( options.templateUrl ).toBe( 'confirm_delete.html' );
            expect( options.controller ).toBe( 'ModalInstanceCtrl' );
            expect( options.resolve.selected() ).toBe( 1 );
            expect( options.resolve.games() ).toBe( scope.$storage.games );
        });

        it( 'should delete the game when confirmed', function() {
            scope.open( 1 );
            modalResult.resolve( 1 );
            $rootScope.$digest();
            expect( scope.$storage.games ).toEqual( [ { title: 'First' }, { title: 'Third' } ] );
        });

        it( 'should keep the game when cancelled', function() {
            scope.open( 1 );
            modalResult.reject( 'cancel' );
            $rootScope.$digest();
            expect( scope.$storage.games.length ).toBe( 3 );
        });
    });

    describe( 'ModalInstanceCtrl', function() {
        let scope, $uibModalInstance, games;

        beforeEach( function() {
            games = [ { title: 'First' }, { title: 'Second' } ];
            $uibModalInstance = { close: vi.fn(), dismiss: vi.fn() };
            scope = {};
            $controller( 'ModalInstanceCtrl', { $scope: scope, $uibModalInstance: $uibModalInstance, selected: 1, games: games } );
        });

        it( 'should expose the selected game', function() {
            expect( scope.game ).toBe( games[1] );
        });

        it( 'should close with the selected index on ok', function() {
            scope.ok();
            expect( $uibModalInstance.close ).toHaveBeenCalledWith( 1 );
        });

        it( 'should dismiss on cancel', function() {
            scope.cancel();
            expect( $uibModalInstance.dismiss ).toHaveBeenCalledWith( 'cancel' );
        });
    });
});
