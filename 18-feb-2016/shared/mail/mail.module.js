(function() {
    'use strict';

    angular
        .module('sprsApp', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider) {
        $stateProvider.state('home.mail', {
            url: '/mail',
            views: {
                'content@home': {
                    templateUrl: './shared/mail/mail.html'
                        /*,
                                            controller : 'MailController as vm'*/
                }
            },
            resolve: {
                Inbox: function(apiResolver) {
                    return apiResolver.resolve('mail.inbox@get');
                }
            }
        });

        $translatePartialLoaderProvider.addPart('./shared/mail');
    }

})();
