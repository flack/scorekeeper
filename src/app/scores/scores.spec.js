describe( 'scores section', function() {
    var scope, $controller, $localStorage;

    beforeEach( function() {
        window.localStorage.clear();
    });

    beforeEach( angular.mock.module( 'ngScorekeeper.scores' ) );

    beforeEach( angular.mock.inject( function( _$controller_, _$localStorage_ ) {
        $controller = _$controller_;
        $localStorage = _$localStorage_;
    }));

    function createController() {
        scope = {};
        $controller( 'ScoresCtrl', { $scope: scope } );
    }

    function addPlayers() {
        scope.$storage.players.push( { id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' } );
    }

    function enterRound( scores ) {
        var row = scope.$storage.rows[scope.$storage.rows.length - 1];
        angular.forEach( scores, function( score, player_id ) {
            row[player_id] = score;
            scope.update_totals( player_id );
        });
    }

    describe( 'controller', function() {
        beforeEach( createController );

        it( 'should set storage defaults', function() {
            expect( scope.$storage.title ).toBe( 'Untitled Game' );
            expect( scope.$storage.rows ).toEqual( [] );
            expect( scope.$storage.games ).toEqual( [] );
            expect( scope.$storage.started ).toBeNull();
            expect( scope.running ).toBe( false );
        });

        it( 'should update totals', function() {
            scope.$storage.players.push( { 'id': 'player1', 'name': 'Player 1' } );
            scope.totals.player1 = 0;
            scope.$storage.rows.push( { player1: 4 } );
            scope.update_totals( 'player1' );
            expect( scope.totals.player1 ).toBe( 4 );
        });

        it( 'should cope with empty inputs', function() {
            scope.$storage.players.push( { 'id': 'player1', 'name': 'Player 1' } );
            scope.totals.player1 = 0;
            scope.$storage.rows.push( { player1: '' } );
            scope.$storage.rows.push( { player1: 4 } );
            scope.update_totals( 'player1' );
            expect( scope.totals.player1 ).toBe( 4 );
        });

        it( 'should ignore invalid input', function() {
            scope.$storage.players.push( { 'id': 'player1', 'name': 'Player 1' } );
            scope.totals.player1 = 0;
            scope.$storage.rows.push( { player1: 4 } );
            scope.$storage.rows.push( { player1: 'x' } );
            scope.update_totals( 'player1' );
            expect( scope.totals.player1 ).toBe( 4 );
        });

        it( 'should accept decimals, negative numbers and a comma as decimal separator', function() {
            scope.$storage.rows.push( { player1: '1,5' }, { player1: '2.25' }, { player1: '-1' } );
            scope.update_totals( 'player1' );
            expect( scope.totals.player1 ).toBe( 2.75 );
        });

        it( 'should find the maximum in row', function() {
            scope.$storage.players.push( { 'id': 'player1', 'name': 'Player 1' } );
            var row = { player1: '4', player2: '3.5' };
            expect( scope.is_max( '4', row ) ).toBeTruthy();
            expect( scope.is_max( '2', row ) ).toBeFalsy();
            expect( scope.is_max( '', row ) ).toBeFalsy();
        });

        it( 'should not mark a maximum in an empty row', function() {
            expect( scope.is_max( '', { player0: '', player1: '' } ) ).toBe( false );
            expect( scope.is_max( '0', { player0: '0', player1: '' } ) ).toBe( false );
        });

        it( 'should start a game with an empty row for every player', function() {
            addPlayers();
            scope.start();
            expect( scope.running ).toBe( true );
            expect( scope.$storage.started ).toEqual( anyDate() );
            expect( scope.$storage.finished ).toBeNull();
            expect( scope.$storage.rows ).toEqual( [ { player0: '', player1: '' } ] );
            expect( scope.totals ).toEqual( { player0: 0, player1: 0 } );
            expect( scope.focus_input ).toBe( true );
        });

        it( 'should clear the previous game when starting a new one', function() {
            addPlayers();
            scope.start();
            enterRound( { player0: '3', player1: '5' } );
            scope.finish();

            scope.start();
            expect( scope.$storage.rows ).toEqual( [ { player0: '', player1: '' } ] );
            expect( scope.totals ).toEqual( { player0: 0, player1: 0 } );
            expect( scope.winners ).toEqual( [] );
        });

        it( 'should add a new row', function() {
            addPlayers();
            scope.start();
            scope.focus_input = false;
            scope.new_row();
            expect( scope.$storage.rows.length ).toBe( 2 );
            expect( scope.$storage.rows[1] ).toEqual( { player0: '', player1: '' } );
            expect( scope.focus_input ).toBe( true );
        });

        it( 'should abort a game', function() {
            addPlayers();
            scope.start();
            enterRound( { player0: '3', player1: '5' } );
            scope.abort();
            expect( scope.running ).toBe( false );
            expect( scope.$storage.started ).toBeNull();
            expect( scope.$storage.rows ).toEqual( [] );
            expect( scope.totals ).toEqual( { player0: 0, player1: 0 } );
            expect( scope.$storage.games ).toEqual( [] );
        });

        it( 'should save the game and pick the winner when finishing', function() {
            addPlayers();
            scope.$storage.title = 'Poker night';
            scope.start();
            enterRound( { player0: '3', player1: '5' } );
            scope.new_row();
            enterRound( { player0: '4', player1: '1' } );
            scope.finish();

            expect( scope.running ).toBe( false );
            expect( scope.$storage.finished ).toEqual( anyDate() );
            expect( scope.winners ).toEqual( [ 'player0' ] );
            expect( scope.$storage.games.length ).toBe( 1 );

            var game = scope.$storage.games[0];
            expect( game.title ).toBe( 'Poker night' );
            expect( game.started ).toEqual( scope.$storage.started );
            expect( game.finished ).toEqual( scope.$storage.finished );
            expect( game.players ).toEqual( scope.$storage.players );
            expect( game.totals ).toEqual( { player0: 7, player1: 6 } );
        });

        it( 'should store a snapshot that later changes do not affect', function() {
            addPlayers();
            scope.start();
            enterRound( { player0: '3', player1: '5' } );
            scope.finish();
            scope.$storage.players[0].name = 'Changed';
            scope.totals.player0 = 100;
            expect( scope.$storage.games[0].players[0].name ).toBe( 'Ann' );
            expect( scope.$storage.games[0].totals.player0 ).toBe( 3 );
        });

        it( 'should put the newest game first', function() {
            addPlayers();
            scope.$storage.title = 'First';
            scope.start();
            scope.finish();
            scope.$storage.title = 'Second';
            scope.start();
            scope.finish();
            expect( scope.$storage.games.map( function( game ) { return game.title; } ) ).toEqual( [ 'Second', 'First' ] );
        });

        it( 'should drop trailing empty rows when finishing', function() {
            addPlayers();
            scope.start();
            enterRound( { player0: '3', player1: '5' } );
            scope.new_row();
            scope.new_row();
            scope.finish();
            expect( scope.$storage.rows ).toEqual( [ { player0: '3', player1: '5' } ] );
        });

        it( 'should report all players with the highest total in a tie', function() {
            addPlayers();
            scope.$storage.players.push( { id: 'player2', name: 'Cid' } );
            scope.start();
            enterRound( { player0: '5', player1: '2', player2: '5' } );
            scope.finish();
            expect( scope.winners ).toEqual( [ 'player0', 'player2' ] );
        });

        it( 'should resume the last finished game', function() {
            addPlayers();
            scope.start();
            enterRound( { player0: '3', player1: '5' } );
            scope.finish();

            scope.resume();
            expect( scope.running ).toBe( true );
            expect( scope.$storage.finished ).toBeNull();
            expect( scope.winners ).toEqual( [] );
            expect( scope.$storage.games ).toEqual( [] );
            expect( scope.$storage.rows ).toEqual( [ { player0: '3', player1: '5' }, { player0: '', player1: '' } ] );
            expect( scope.totals ).toEqual( { player0: 3, player1: 5 } );
        });
    });

    describe( 'controller restoring a stored game', function() {
        beforeEach( function() {
            $localStorage.players = [ { id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' } ];
            $localStorage.rows = [ { player0: '3', player1: '5' }, { player0: '1', player1: '' } ];
            $localStorage.started = new Date();
        });

        it( 'should recalculate the totals and continue a running game', function() {
            $localStorage.finished = null;
            createController();
            expect( scope.totals ).toEqual( { player0: 4, player1: 5 } );
            expect( scope.running ).toBe( true );
        });

        it( 'should not continue a finished game', function() {
            $localStorage.finished = new Date();
            createController();
            expect( scope.totals ).toEqual( { player0: 4, player1: 5 } );
            expect( scope.running ).toBe( false );
        });
    });

    describe( 'filters', function() {
        beforeEach( function() {
            $localStorage.players = [ { id: 'player0', name: 'Ann' }, { id: 'player1', name: 'Bob' }, { id: 'player2', name: 'Cid' } ];
        });

        it( 'playername should resolve a player id to its name', angular.mock.inject( function( playernameFilter ) {
            expect( playernameFilter( 'player1' ) ).toBe( 'Bob' );
            expect( playernameFilter( 'player9' ) ).toBe( 'player9 not found' );
        }));

        it( 'playernames should join the names of the given player ids', angular.mock.inject( function( playernamesFilter ) {
            expect( playernamesFilter( [ 'player2', 'player0' ] ) ).toBe( 'Ann, Cid' );
            expect( playernamesFilter( [] ) ).toBe( '' );
        }));
    });

    describe( 'directives', function() {
        var $compile, $rootScope, $timeout;

        beforeEach( angular.mock.inject( function( _$compile_, _$rootScope_, _$timeout_ ) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
        }));

        describe( 'selectOnFocus', function() {
            var element;

            beforeEach( function() {
                element = $compile( '<input select-on-focus value="12">' )( $rootScope );
                vi.spyOn( element[0], 'select' );
            });

            it( 'should select the input on focus', function() {
                element.triggerHandler( 'focus' );
                expect( element[0].select ).toHaveBeenCalled();
            });

            it( 'should select the input on click', function() {
                element.triggerHandler( 'click' );
                expect( element[0].select ).toHaveBeenCalled();
            });
        });

        describe( 'focusMe', function() {
            var element;

            beforeEach( function() {
                $rootScope.focus_input = false;
                element = $compile( '<input focus-me="focus_input">' )( $rootScope );
                vi.spyOn( element[0], 'focus' );
                $rootScope.$digest();
            });

            it( 'should focus the element when the expression becomes true', function() {
                $timeout.flush();
                expect( element[0].focus ).not.toHaveBeenCalled();

                $rootScope.focus_input = true;
                $rootScope.$digest();
                $timeout.flush();
                expect( element[0].focus ).toHaveBeenCalledTimes( 1 );
            });

            it( 'should reset the expression on blur', function() {
                $rootScope.focus_input = true;
                $rootScope.$digest();
                element.triggerHandler( 'blur' );
                expect( $rootScope.focus_input ).toBe( false );
            });

            it( 'should not fail on a read-only expression', function() {
                $rootScope.flag = true;
                element = $compile( '<input focus-me="flag && true">' )( $rootScope );
                $rootScope.$digest();
                expect( function() { element.triggerHandler( 'blur' ); } ).not.toThrow();
            });
        });

        describe( 'contenteditable', function() {
            var element;

            beforeEach( function() {
                $rootScope.default_title = 'Untitled Game';
                $rootScope.title = 'Poker night';
                element = $compile( '<h1 contenteditable ng-model="title"></h1>' )( $rootScope );
                $rootScope.$digest();
            });

            it( 'should render the model', function() {
                expect( element.text() ).toBe( 'Poker night' );
            });

            it( 'should render the default title when the model is empty', function() {
                $rootScope.title = '';
                $rootScope.$digest();
                expect( element.text() ).toBe( 'Untitled Game' );
            });

            it( 'should update the model with the trimmed text on blur', function() {
                element.text( '  Skat  ' );
                element.triggerHandler( 'blur' );
                expect( $rootScope.title ).toBe( 'Skat' );
                expect( element.text() ).toBe( 'Skat' );
            });

            it( 'should keep unchanged text on blur', function() {
                element.triggerHandler( 'blur' );
                expect( $rootScope.title ).toBe( 'Poker night' );
                expect( element.text() ).toBe( 'Poker night' );
            });

            it( 'should fall back to the default title when the text is cleared', function() {
                element.text( '   ' );
                element.triggerHandler( 'blur' );
                expect( $rootScope.title ).toBe( 'Untitled Game' );
                expect( element.text() ).toBe( 'Untitled Game' );
            });

            it( 'should do nothing without ng-model', function() {
                element = $compile( '<h1 contenteditable>Static</h1>' )( $rootScope );
                element.triggerHandler( 'blur' );
                expect( element.text() ).toBe( 'Static' );
            });
        });
    });

    // Matches any Date; the exact start/finish time is not under test
    function anyDate() {
        return expect.any( Date );
    }
});
