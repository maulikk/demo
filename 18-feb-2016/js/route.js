(function() {
    'use strict';

    angular
        .module('sprsApp')
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        //$locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    'main@': {
                        templateUrl: './shared/core/layouts/default.html'
                    },
                    'toolbar@home': {
                        templateUrl: './shared/toolbar/toolbar.html'
                    },
                    'navigation@home': {
                        templateUrl: './shared/sidenav/sidenav.html'
                    },
                    'mail@home': {
                        templateUrl: './shared/mail/mail.html'
                    }
                }

            })
            .state('home.newRequest', {
                url: 'new-request',
                views: {
                    'main-content@home': {
                        templateUrl: './shared/newRequest/new-request.html'
                    }
                }
            })
            .state('home.myprofile', {
                url: 'my-profile',
                views: {
                    'main-content@home': {
                        templateUrl: './shared/myprofile/my-profile.html'
                    }
                }
            })
            .state('home.briefcase', {
                url: 'briefcase',
                views: {
                    'main-content@home': {
                        templateUrl: './shared/mail/briefcase/briefcase.html'
                    }
                }
            })
            .state('home.myaccess', {
                url: 'my-access',
                views: {
                    'main-content@home': {
                        templateUrl: './shared/myaccess/my-access.html'
                    }
                }
            })
            .state('home.certifications', {
                url: 'certifications',
                views: {
                    'main-content@home': {
                        templateUrl: './shared/certifications/certifications.html'
                    }
                }
            })
            .state('home.reports', {
                url: 'reports',
                views: {
                    'main-content@home': {
                        templateUrl: './shared/reports/reports.html'
                    }
                }
            })
            .state('home.approvesuccess', {
                url: 'approvesuccess',
                views: {
                    'main@': {
                        templateUrl: './shared/core/layouts/default.html'
                    },
                    'toolbar@home': {
                        templateUrl: './shared/toolbar/toolbar.html'
                    },
                    'navigation@home': {
                        templateUrl: './shared/sidenav/sidenav.html'
                    },
                    'mail@home': {
                        templateUrl: './shared/mail/mail.html'
                    }
                }
            })
            .state('home.access#discussionquestion', {
                url: 'access#discussionquestion',
                views: {
                    'content-card@home': {
                        templateUrl: './shared/mail/access/access.html'
                    }
                }
            })
            .state('home.approval', {
                url: 'approval',
                views: {
                    'content-card@home': {
                        templateUrl: './shared/mail/approval/requests-approval.html'
                    }
                }
            })
            .state('home.access#discussion', {
                url: 'access#discussion',
                views: {
                    'content-card@home': {
                        templateUrl: './shared/mail/access/access.html'
                    }
                }
            })
            .state('home.access', {
                url: 'access',
                views: {
                    'content-card@home': {
                        templateUrl: './shared/mail/access/access.html'
                    }
                }
            });
    }
})();

/*$stateProvider
    .state('/', {
        abstract: true,
        views   : {
            'main'         : {
                templateUrl: 'shared/core/layouts/default.html'
            }/*,
            'toolbar@app': {
                templateUrl: 'app/toolbar/toolbar.html',
                controller : 'ToolbarController as vm'
            },
            'navigation@app': {
                templateUrl: 'app/sidenav/navigation/navigation.html',
                controller : 'NavigationController as vm'
            },
            'quickPanel@app': {
                templateUrl: 'app/sidenav/quick-panel/quick-panel.html',
                controller : 'QuickPanelController as vm'
            },
            'themeOptions'  : {
                templateUrl: 'app/core/theming/theme-options/theme-options.html',
                controller : 'ThemeOptionsController as vm'
            }
        }
    });*/
