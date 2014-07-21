angular.module('ngScorekeeper.animations', [
    'ngAnimate'
])

.animation('.delete-animation', function() {

    var speed = 250,
    delete_animation = function(element, className, done)
    {
        element.css({
            height: jQuery(element).innerHeight() + 'px',
            opacity: 1
        });

        jQuery(element).animate({
            height: 0,
            opacity: 0
        }, speed, function(){element.remove(); return done;});

        return function(cancel) {
            if(cancel) {
                element.stop();
            }
        };
    };

    return {
        leave: delete_animation
    };
})
.animation('.show-after-animation', ['$timeout', function($timeout) {

    var speed = 250,

    wait = function(element, done)
    {
        jQuery(element).hide();
        var promise = $timeout(function()
        {
            jQuery(element).show();
            done();
        }, speed);

        return function(cancel) {
            if(cancel) {
                $timeout.cancel(promise);
            }
        };
    },
    add_animation = function(element, className, done)
    {
        if (className !== 'ng-show')
        {
            return;
        }

        return wait(element, done);
    },
    remove_animation = function(element, className, done)
    {
        if (className !== 'ng-hide')
        {
            return;
        }

        return wait(element, done);
    };


    return {
        addClass: add_animation,
        removeClass: remove_animation
    };
}]);
