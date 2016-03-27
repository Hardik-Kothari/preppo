var preppo = angular.module('dashboardApp', ['ngCookies', 'ngRoute', 'ngSanitize']);

preppo.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/currentAffairs/dailyUpdates/:mode', {
        templateUrl: './views/current-affairs-daily-updates.html',
        controller: 'CADailyUpdatesController'
    });
    $routeProvider.when('/currentAffairs/monthlyDigest', {
        templateUrl: './views/current-affairs-monthly-digest.html',
        controller: 'CAMonthlyDigestController'
    });
    $routeProvider.when('/currentAffairs/quiz', {
        templateUrl: './views/current-affairs-quiz-home.html',
        controller: 'CAQuizHomeController'
    });
    $routeProvider.when('/currentAffairs/quiz/:id', {
        templateUrl: './views/current-affairs-quiz-office.html',
        controller: 'CAQuizOfficeController'
    });
    $routeProvider.otherwise({
        redirectTo: '/currentAffairs/dailyUpdates/normal'
    });
}]);

preppo.run(['$rootScope', '$timeout', function ($rootScope, $timeout) {
    $rootScope.$on('$viewContentLoaded', function() {
        $timeout(function() {
            componentHandler.upgradeAllRegistered();
        });
    });
}]);

preppo.constant('apiDomainName', 'https://prod.api.preppo.in/v1/app');

preppo.constant('categories', ['Current Affairs', 'Mock Test', 'Practice Test']);

preppo.constant('subCategories', {'Current Affairs': ['Daily Updates', 'Quiz', 'Monthly Digest'], 'Mock Test': [], 'Practice Test': [] });

preppo.factory('viewingLang', function() {
    var obj = {
        current: "english",
        langs: ['english', 'hindi'],
        setLang: function(lng) {
            obj.current = lng;
        }
    };
    return obj;
});

preppo.factory('userService', ['$http', 'apiDomainName', '$cookies', function($http, apiDomainName, $cookies) {
    var userInfo = {
        loggedIn: false,
        sessionToken: "",
        lang: "english",
        sharedOnFb: false
    };
    
    function setUserInfoFromCookie() {
        userInfo.sessionToken = $cookies.get('sessionToken');
        userInfo.sharedOnFb = $cookies.get('sharedOnFb')?(($cookies.get('sharedOnFb')=="false")?false:true):false;
        userInfo.loggedIn = false;
        
        if(userInfo.sessionToken) {
            userInfo.loggedIn = true;
        }
        if($cookies.get('lang')) {
            userInfo.lang = $cookies.get('lang');
        }
        return;
    }
    
    function setUserInfoAndCookie(sessionToken, sharedOnFb, lang) {
        userInfo.sessionToken = sessionToken;
        userInfo.lang = lang;
        userInfo.sharedOnFb = sharedOnFb;
        userInfo.loggedIn = true;
        var date = new Date("October 13, 9999 11:13:00");
        $cookies.put('sessionToken', sessionToken, {expires: date});
        $cookies.put('lang', lang, {expires: date});
        $cookies.put('sharedOnFb', sharedOnFb?"true":"false", {expires: date});
        return;
    }
    
    function clearUserInfoAndCookie() {
        $cookies.remove('sessionToken');
        $cookies.remove('lang');
        $cookies.remove('sharedOnFb');
        userInfo.loggedIn = false;
        userInfo.sessionToken = '';
        userInfo.lang = 'english';
        userInfo.sharedOnFb = false;
    }
    
    function getFirstName() {
        var sss = "";
        if(userInfo.name) {
            sss = userInfo.name.trim();
        }
        if(sss == "") {
            return "Anonymous";
        }
        var arr = sss.split(" ");
        return arr[0];
    }
    
    function setLang(lang) {
        userInfo.lang = lang;
        var date = new Date("October 13, 9999 11:13:00");
        $cookies.put('lang', lang, {expires: date});
    }
    
    var obj = {
        userInfo: userInfo,
        setUserInfoFromCookie: setUserInfoFromCookie,
        setUserInfoAndCookie: setUserInfoAndCookie,
        clearUserInfoAndCookie: clearUserInfoAndCookie,
        setLang: setLang
    };
    
    return obj;
}]);

preppo.factory('dateToString', function() {
    var func = function (dt) {
        var zero = "0";
        var year = dt.getFullYear().toString();
        var month = (dt.getMonth()+1).toString();
        if(month.length == 1) {
            month = zero.concat(month);
        }
        var dt = dt.getDate().toString();
        if(dt.length == 1) {
            dt = zero.concat(dt);
        }
        var dateString =  year + "-" + month + "-" + dt;
        return dateString;
    };
    return {
        convert: func
    }
});

preppo.factory('quizService', function() {
    var obj = {};
    return {
        quiz: obj
    };
});

preppo.controller('MainController', ['$scope', 'userService', 'categories', 'subCategories', '$location', 'apiDomainName', '$http', function($scope, userService, categories, subCategories, $location, apiDomainName, $http) {
    $scope.currentCategory = categories[0];
    $scope.loading = false;
    $scope.isDrawerOpen = false;
    $scope.shouldFloatLeft = true;
    $scope.user = userService;
    
    userService.setUserInfoFromCookie();
    
    $scope.tester = function() {
        $scope.shouldFloatLeft = !$scope.shouldFloatLeft;
        $scope.isDrawerOpen = !$scope.isDrawerOpen;
    };
    
    function goTo(subCat) {
        if($scope.currentCategory == 'Current Affairs') {
            if(subCat == 'Daily Updates') {
                $location.path('/currentAffairs/dailyUpdates/normal');
            }
            else if(subCat == 'Monthly Digest') {
                $location.path('/currentAffairs/monthlyDigest');   
            }
            else if(subCat == 'Quiz') {
                $location.path('/currentAffairs/quiz');   
            }
        }
        else if($scope.currentCategory == 'Mock Test') {

        }
        else if($scope.currentCategory == 'Practice Test') {

        }
    }
    if($location.path() == '/currentAffairs/dailyUpdates/normal') {
        goTo('Daily Updates');
    }
    else if($location.path() == '/currentAffairs/monthlyDigest') {
        goTo('Monthly Digest');
    }
    else if($location.path() == '/currentAffairs/quiz') {
        goTo('Quiz');
    }
    //goTo(subCategories[$scope.currentCategory][0]);
    $scope.goTo = goTo;
    
    $scope.travel = function(subCat) {
        if(userService.userInfo.loggedIn && userService.userInfo.sharedOnFb) {
            $scope.goTo(subCat);
        }
        else {
            $('#shareModal').modal('show');
        }
    };
    
    function fblogin(response) {
        var data = {
            fbToken: response.authResponse.accessToken,
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = apiDomainName + '/auth/login';
        $http.post(url, data, config).then(function successCallback(response) {
            var data = response.data;
            var usr = data['user'];
            userService.setUserInfoAndCookie(data['x-session-token'], usr.sharedOnFb?true: false, usr.lang?usr.lang:'english');
            if(!usr.sharedOnFb) {
                FB.ui({
                    method: 'feed',
                    link: 'https://preppo.in',
                    caption: 'preppo.in'
                }, function(response){
                    //console.log("response : " + response);
                    if(response['post_id']) {
                        var dt = {
                            sharedOnFb: true
                        };
                        var config = {
                            headers: {
                                'Content-Type': 'application/json',
                                'x-session-token': data['x-session-token']
                            }
                        };
                        var url = apiDomainName + '/users/me';
                        $http.put(url, dt, config).then(function successCallback(response) {
                            $('#shareModal').modal('hide');
                            userService.setUserInfoAndCookie(data['x-session-token'], true, usr.lang?usr.lang:'english');
                            $scope.goTo('Monthly Digest');
                        }, function errorCallback(response){
                            //console.log('error : ' + JSON.stringify(response));
                        }); 
                    }
                    else {
                        //
                    }
                });
            }
            else {
                $('#shareModal').modal('hide');
                $scope.goTo('Monthly Digest');
            }
        }, function errorCallback(response){
            if(response.data.error == "INVALID_TOKEN") {
                alert("Invalid token.");
            }
            else {
                //console.log('error : ' + JSON.stringify(response));
            } 
        });
    }
    
    $scope.fb = function() {
        FB.login(function(response) {
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                //console.log("jgd login");
                fblogin(response);
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
                //console.log("not_authorized")

            } else {
                // The person is not logged into Facebook, so we're not sure if
                // they are logged into this app or not.
                //console.log("else")
            }
        }, {scope: 'public_profile, email, user_friends'});
    };
    
    $scope.changeLang = function() {
        if(userService.userInfo.lang == 'english') {
            $('.toggle-button').find('button').removeClass('left');
            $('.toggle-button').find('button').addClass('right');
            userService.setLang('hindi');
        }
        else {
            $('.toggle-button').find('button').removeClass('right');
            $('.toggle-button').find('button').addClass('left');
            userService.setLang('english');
        }
    };
    
}]);

preppo.controller('CADailyUpdatesController', ['$scope', 'userService', '$http', 'dateToString', 'apiDomainName', '$location', '$route', '$routeParams', function($scope, userService, $http, dateToString, apiDomainName, $location, $route, $routeParams) {
    $http.defaults.withCredentials = true;
    $scope.dateToString = dateToString;
    $scope.currentDate = new Date();
    $scope.newsUpdates = [];
    $scope.fetchInfo = {};
    $scope.currentNews = 0;
    $scope.fetchingStatus = 1; // 0-failed, 1-fetching, 2-fetched, 3-finished. Used for showing last slide.
    $scope.newsIndexToBeCompared = [0, -1];
    $scope.visible = 0;
    $scope.firstDate = new Date();
    $scope.user = userService;
    $scope.isSliding = [false, false];
    $scope.errorDate = new Date();
    $scope.arr = [0, 1];
    $scope.ids = ['#carousel-0', '#carousel-1'];
    
    function start() {
        var dt = new Date($scope.currentDate.getTime());
        dt.setDate(dt.getDate() - 1);
        var prevDateString = dateToString.convert(dt);
        var dateString = dateToString.convert($scope.currentDate);
        
        var config = {
            params: {
                'date': dateString
            }
        };
        var url = apiDomainName + "/news";
        $http.get(url, config).then(function successCallback(response) {
            if(response.data.length == 0) {
                var config = {
                    params: {
                        'date': prevDateString
                    }
                };
                var url = apiDomainName + "/news";
                $http.get(url, config).then(function successCallback(response) {
                    if(response.data.length == 0) {
                        $scope.fetchingStatus = 3;
                    }
                    else {
                        $scope.fetchingStatus = 2;
                        for(var i=0; i<response.data.length; i++) {
                            response.data[i]['dateString'] = prevDateString;
                        }
                        $scope.newsUpdates = response.data;
                        $scope.fetchInfo[prevDateString] = {
                            len : response.data.length,
                            total : 0,
                            isLastDate : true
                        };
                        $scope.firstDate = new Date(dt.getTime());
                        $scope.newsIndexToBeCompared[$scope.visible] = $scope.currentNews;
                        $scope.currentDate.setDate($scope.currentDate.getDate() - 1);
                    }
                }, function errorCallback(response) {
                    $scope.fetchingStatus = 4;
                });     
            }
            else {
                //console.log('news : ' + JSON.stringify(response));
                $scope.fetchingStatus = 2;
                for(var i=0; i<response.data.length; i++) {
                    response.data[i]['dateString'] = dateString;
                }
                $scope.newsUpdates = response.data;
                $scope.fetchInfo[dateString] = {
                    len : response.data.length,
                    total : 0,
                    isLastDate : true
                };
                $scope.firstDate = new Date($scope.currentDate.getTime());
                $scope.newsIndexToBeCompared[$scope.visible] = $scope.currentNews;
            }
        }, function errorCallback(response) {
            $scope.fetchingStatus = 4;
        });
    }
    start();
    if($routeParams.mode == 'transit') {
        $scope.$parent.travel('Monthly Digest');
    }
    
    $scope.fetchData = function(date) {
        var dt = new Date(date.getTime());
        dt.setDate(dt.getDate() - 1);
        var prevDateString = dateToString.convert(dt);
        var dateString = dateToString.convert(date);
        $scope.fetchingStatus = 1;
        $scope.fetchInfo[dateString].isLastDate = false;
        var config = {
            params: {
                'date': prevDateString,
            }
        };
        var url = apiDomainName + "/news";
        $http.get(url, config).then(function successCallback(response) {
            if(response.data.length == 0) {
                $scope.fetchingStatus = 3;
            }
            else {
                $scope.fetchingStatus = 2;
                for(var i=0; i<response.data.length; i++) {
                    response.data[i]['dateString'] = prevDateString;
                }
                $scope.newsUpdates = $scope.newsUpdates.concat(response.data);
                
                if($scope.currentNews == $scope.newsUpdates.length-response.data.length) {
                    $scope.newsIndexToBeCompared[$scope.visible] = $scope.currentNews;
                }
                
                $scope.fetchInfo[prevDateString] = {
                    len : response.data.length,
                    total : $scope.fetchInfo[dateString].total + $scope.fetchInfo[dateString].len,
                    isLastDate : true
                };
            }
            //console.log('news' + JSON.stringify(response));
        }, function errorCallback(response) {
            $scope.errorDate = new Date(date.getTime());
            $scope.fetchingStatus = 0;
        });
    };
    
    $scope.prev = function() {
        if($scope.isSliding[$scope.visible]) {
            return;
        }
        if($scope.currentNews == 0) {
            // Kuch nhi hoga bhai. bas kar
        }
        else {
            $($scope.ids[$scope.visible]).carousel('prev');
            if($scope.currentNews == $scope.newsUpdates.length || $scope.currentNews == $scope.fetchInfo[dateToString.convert($scope.currentDate)].total) {
                $scope.currentDate.setDate($scope.currentDate.getDate() + 1);
            }
            $scope.currentNews--;
        }
    };
    
    $scope.next = function() {        
        if($scope.isSliding[$scope.visible]) {  
            return;
        }
        if($scope.currentNews == $scope.newsUpdates.length) {
            // Kuch nhi hoga bhai. bas kar 
        }
        else {
            $($scope.ids[$scope.visible]).carousel('next');
            if($scope.currentNews == $scope.fetchInfo[dateToString.convert($scope.currentDate)].total && $scope.fetchInfo[dateToString.convert($scope.currentDate)].isLastDate) {
                $scope.fetchData(new Date($scope.currentDate.getTime()));
            }
            if($scope.currentNews+1 == $scope.fetchInfo[dateToString.convert($scope.currentDate)].total+$scope.fetchInfo[dateToString.convert($scope.currentDate)].len) {
                $scope.currentDate.setDate($scope.currentDate.getDate() - 1);
            }
            $scope.currentNews++;
        }
    };
    
    $scope.keyPressed = function(event) {
        var key = event.keyCode?event.keyCode : event.which;
        if(key == 37) {
            $scope.prev();
        }
        else if(key == 39) {
            $scope.next();
        }
        else {
            //nothing
        }
    };
    
    $scope.backToTop = function() {
        //$('.carousel').carousel('prev');
        //var clone = $scope.newsUpdates.slice(0);
        //$scope.newsUpdates = [];
        $scope.currentNews = 0;
        $($scope.ids[$scope.visible]).find('.item.active').removeClass('active');
        $scope.newsIndexToBeCompared[$scope.visible] = -1;
        $scope.visible = ($scope.visible+1)%2;
        $scope.newsIndexToBeCompared[$scope.visible] = 0;
        $scope.currentDate = $scope.firstDate;
        //$scope.newsUpdates = clone;
    };
    
    $scope.share = function(index) {
        var lang = (userService.userInfo.lang == 'english')?'e':'h';
        var header = $scope.newsUpdates[index].content.english.heading.replace(/ /g,"-");
        var url = "https://preppo.in/news/" + $scope.newsUpdates[index].dateString + "/" + header + "?l=" + lang + "&id=" + $scope.newsUpdates[index]._id;
        FB.ui({
            method: 'feed',
            link: url,
            caption: 'preppo.in'
        }, function(response){
            console.log(JSON.stringify(response));
        });
    };
    
    $scope.prettify = function(str) {
        str = str.replace(/&nbsp;/g, "");
        str = str.replace(/<br>/g, "");
        str = str.replace(/<br\/>/g, "");
        str = str.replace(/<br >/g, "");
        str = str.replace(/<br \/>/g, "");
        return str;
    };
    
    $scope.getDateObj = function(str) {
        var dt = new Date(str);
        return dt;
    };
    
    $scope.refreshPage = function() {
        $route.reload();
    };
    
    $scope.changeLang = function() {
        if(userService.userInfo.lang == 'english') {
            $('.toggle-button').find('button').removeClass('left');
            $('.toggle-button').find('button').addClass('right');
            userService.setLang('hindi');
        }
        else {
            $('.toggle-button').find('button').removeClass('right');
            $('.toggle-button').find('button').addClass('left');
            userService.setLang('english');
        }
    };
    
}]);

preppo.controller('CAMonthlyDigestController', ['$scope', 'userService', '$http', 'apiDomainName', '$location', '$window', function($scope, userService, $http, apiDomainName, $location, $window) {
    $scope.digests = {
        'english': [],
        'hindi': []
    };
    $scope.classNames = ['class1', 'class2', 'class3', 'class4'];
    $scope.user = userService;
    $scope.fetched = false;
    
    function fetchData() {
        var config = {
            headers: {
                'x-session-token': $scope.user.userInfo.sessionToken
            }
        };
        var url = apiDomainName + "/news/monthlydigest";
        $http.get(url, config).then(function successCallback(response) {
            for(var i=0; i<response.data.length; i++) {
                $scope.digests[response.data[i]['language']].push(response.data[i]);
            }
            $scope.fetched = true;
        }, function errorCallback(response) {
            $scope.fetched = true;
            alert('Check internet connection.');
        });     
    }
    fetchData();
    
    $scope.getClassName = function(index) {
        return $scope.classNames[index % $scope.classNames.length];
    };
    
    $scope.changeLang = function() {
        if(userService.userInfo.lang == 'english') {
            $('.toggle-button').find('button').removeClass('left');
            $('.toggle-button').find('button').addClass('right');
            userService.setLang('hindi');
        }
        else {
            $('.toggle-button').find('button').removeClass('right');
            $('.toggle-button').find('button').addClass('left');
            userService.setLang('english');
        }
    };
}]);

preppo.controller('CAQuizHomeController', ['$scope', 'userService', '$http', 'dateToString', '$location', 'apiDomainName', 'quizService', function($scope, userService, $http, dateToString, $location, apiDomainName, quizService) {
    $scope.fetchLimit = 20;
    $scope.quizzes = [];
    $scope.belowDataStatus = 0;     // 1-pending data 2-fetching data 3-fetched data. makes sense only when quizzes.length>0
    $scope.isLoading = false;
    $scope.dateToString = dateToString;
    $scope.user = userService;
    $scope.fetched = false;
    
    function fetchData() {
        var config = {
            params: {
                'limit': $scope.fetchLimit
            }
        };
        var url = apiDomainName + "/news/quiz";
        $http.get(url, config).then(function successCallback(response) {
            $scope.quizzes = response.data;
            if($scope.quizzes.length < $scope.fetchLimit) {
                $scope.belowDataStatus = 3;
            }
            else {
                $scope.belowDataStatus = 1;
            }
            $scope.fetched = true;
        }, function errorCallback(response) {
            $scope.fetched = true;
            alert('Check internet connection.');
        });
    }
    fetchData();
    
    $scope.showMore = function() {
        $scope.belowDataStatus = 2;
        var lastQuiz = $scope.quizzes[$scope.quizzes.length-1];
        var dateString = dateToString.convert(new Date(lastQuiz.publishDate));
        var config = {
            params: {
                'limit': $scope.fetchLimit,
                'lt': dateString
            }
        };
        var url = apiDomainName + "/news/quiz";
        $http.get(url, config).then(function successCallback(response) {
            var quizzes = response.data;
            //console.log("quiz : " + JSON.stringify(quizzes));
            if(quizzes.length < $scope.fetchLimit) {
                $scope.belowDataStatus = 3;
            }
            else {
                $scope.belowDataStatus = 1;
            }
            for(var i=$scope.quizzes.length-1; i>=0; i--) {
                if(dateToString.convert(new Date($scope.quizzes[i].publishDate)) == dateString) {
                    var id = $scope.quizzes[i]._id ;
                    for(var j=0; j<quizzes.length; j++) {
                        if(quizzes[j]._id == id) {
                            quizzes.splice(j, 1);
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
            //console.log("quiz : " + JSON.stringify(quizzes));
            $scope.quizzes = $scope.quizzes.concat(quizzes);
        }, function errorCallback(response) {
            $scope.belowDataStatus = 1;
        });
    };
    
    $scope.fetchQuiz = function(index) {
        quizService.quiz = $scope.quizzes[index];
        $location.path('/currentAffairs/quiz/' + $scope.quizzes[index]._id);
    };
    
    $scope.changeLang = function() {
        if(userService.userInfo.lang == 'english') {
            $('.toggle-button').find('button').removeClass('left');
            $('.toggle-button').find('button').addClass('right');
            userService.setLang('hindi');
        }
        else {
            $('.toggle-button').find('button').removeClass('right');
            $('.toggle-button').find('button').addClass('left');
            userService.setLang('english');
        }
    };
    
}]);

preppo.controller('CAQuizOfficeController', ['$scope', 'userService', '$http', '$routeParams', 'apiDomainName', 'quizService', '$window', '$location', function($scope, userService, $http, $routeParams, apiDomainName, quizService, $window, $location) {
    $scope.id = $routeParams.id;
    $scope.quiz = quizService.quiz;
    $scope.questions = [];
    $scope.currentQuestionIndex = 1;
    $scope.attempted = false;
    $scope.correctAnswers = 0;
    $scope.attemptedQuestions = 0;
    $scope.isLoading = false;
    $scope.questionData = {
        statement: {
            english: "",
            hindi: ""
        },
        options: {
            english: ["", "", "", ""],
            hindi: ["", "", "", ""]
        },
        correctAnswer: {
            english: 0,
            hindi: 0
        },
        solution: {
            english: "",
            hindi: ""
        }
    };
    $scope.optionLabels = ['A', 'B', 'C', 'D', 'E'];
    $scope.clickedIndex = -1;
    $scope.bottomButtonLabel = "NEXT";
    $scope.user = userService;
    $scope.isClicked = [false, false, false, false, false];
    
    function resetQuestion() {
        var question = $scope.questions[$scope.currentQuestionIndex - 1];
        var langs = ['english', 'hindi'];
        var options = {
            english: [],
            hindi: []
        };
        var correctAnswer = {
            english: 0,
            hindi: 0
        };
        var solution = {
            english: "",
            hindi: ""
        };
        for(var i=0; i<langs.length; i++) {
            for(var j=0; j<question.content[langs[i]].options.length; j++) {
                options[langs[i]].push(question.content[langs[i]].options[j].optionString);
                solution[langs[i]] = question.content[langs[i]].solution;
                if(question.content[langs[i]].options[j].correct) {
                    correctAnswer[langs[i]] = j;   
                }
            }
        }
        
        $scope.questionData = {
            statement: {
                english: question.content.english.questionString,
                hindi: question.content.hindi.questionString
            },
            options: options,
            correctAnswer: correctAnswer,
            solution : solution
        };
        $scope.clickedIndex = -1;
        if($scope.currentQuestionIndex == $scope.questions.length) {
            $scope.bottomButtonLabel = "FINISH";
        }
    }
    $scope.resetQuestion = resetQuestion;
    
    function fetchData() {
        $scope.isLoading = true;
        var config = {
        };
        var url = apiDomainName + "/news/quiz/" + $scope.id;
        $http.get(url, config).then(function successCallback(response) {
            $scope.questions = response.data;
            $scope.isLoading = false;
            $scope.resetQuestion();
        }, function errorCallback(response) {
            $scope.isLoading = false;
        });
    }
    fetchData();
    
    $scope.next = function(nextOrFinish) {
        if(!$scope.attempted) {
            $scope.attempted = true;
            $scope.clickedIndex = -1;
        }
        else {
            if(nextOrFinish == "NEXT") {
                $scope.currentQuestionIndex++;
                $scope.attempted = false;
                $scope.resetQuestion();
            }
            else {
                $('#finishModal').modal('show');
            }
        }
    };
    
    $scope.checkAnswer = function(index) {
        if(!$scope.attempted) {
            $scope.attempted = true;
            $scope.attemptedQuestions++;
            $scope.clickedIndex = index;
            if($scope.questionData.correctAnswer[$scope.user.userInfo.lang] == index) {
                $scope.correctAnswers++;
            }
        }
    };
    
    $scope.goBack = function() {
        $window.history.back();  
    };
    
    $scope.clicked = function(index) {
        for(var i=0; i<5; i++) {
            if(i == index) {
                $scope.isClicked[i] = true;
            }
            else {
                $scope.isClicked[i] = false;
            }
        }
    };
    
    $scope.finishQuiz = function() {
        var rating = 0;
        for(var i=0; i<5; i++) {
            if($scope.isClicked[i]) {
                rating = 5-i;
                break;
            }
        }
        
        $('#finishModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $scope.goBack();
        
        if(rating != 0) {
            var data = {
                'quizId': $scope.id,
                'rating': rating
            };
            var config = {
                headers: {
                    'Content-Type' : 'application/json'
                }
            };
            var url = apiDomainName + "/extra/ratings/news/quiz";
            $http.post(url, data, config).then(function successCallback(response) {
                //console.log('lols');
            }, function errorCallback(response) {
                //console.log('luls');
            });
        }
    };
    
    $scope.changeLang = function() {
        if(userService.userInfo.lang == 'english') {
            $('.toggle-button').find('button').removeClass('left');
            $('.toggle-button').find('button').addClass('right');
            userService.setLang('hindi');
        }
        else {
            $('.toggle-button').find('button').removeClass('right');
            $('.toggle-button').find('button').addClass('left');
            userService.setLang('english');
        }
    };
    
}]);
