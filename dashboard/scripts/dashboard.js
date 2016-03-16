var preppo = angular.module('dashboardApp', ['ngCookies', 'ngRoute', 'ngSanitize']);

preppo.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/currentAffairs/dailyUpdates', {
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
}]);

preppo.run(function ($rootScope, $timeout) {
    $rootScope.$on('$viewContentLoaded', function() {
        $timeout(function() {
            componentHandler.upgradeAllRegistered();
        });
    });
});

preppo.constant('apiDomainName', 'https://prod.api.preppo.in/v1/app');

preppo.constant('categories', ['Current Affairs', 'Mock Test', 'Practice Test']);

preppo.constant('subCategories', {'Current Affairs': ['Daily Updates', 'Monthly Digest', 'Quiz'], 'Mock Test': [], 'Practice Test': [] });

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
        userInfo.sharedOnFb = ($cookies.get('sharedOnFb')=="false")?false:true;
        userInfo.lang = "english";
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
    
    var obj = {
        userInfo: userInfo,
        setUserInfoFromCookie: setUserInfoFromCookie,
        setUserInfoAndCookie: setUserInfoAndCookie,
        clearUserInfoAndCookie: clearUserInfoAndCookie
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
    
    userService.setUserInfoFromCookie();
    
    function goTo(subCat) {
        if($scope.currentCategory == 'Current Affairs') {
            if(subCat == 'Daily Updates') {
                $location.path('/currentAffairs/dailyUpdates');
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
    goTo(subCategories[$scope.currentCategory][0]);
    $scope.goTo = goTo;
    
    $scope.travel = function(subCat) {
        if(userService.userInfo.loggedIn && userService.userInfo.sharedOnFb) {
            $scope.goTo(subCat);
        }
        else {
            $('#shareModal').modal('show');
        }
    };
    
    $scope.fb = function() {
        FB.login(function(response) {
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                console.log("connected")
                console.log(response.authResponse.accessToken);
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
                    //userService.setUserInfoFromCookie();
                    if(!usr.sharedOnFb) {
                        FB.ui({
                            method: 'share',
                            href: 'http://onequestiondaily.preppo.in',
                        }, function(response){
                            if(response['post_id']) {
                                var data = {
                                    sharedOnFb: true
                                };
                                var config = {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'x-session-token': data['x-session-token']
                                    }
                                };
                                var url = apiDomainName + '/users/me';
                                $http.put(url, data, config).then(function successCallback(response) {
                                    $('#shareModal').modal('hide');
                                    $scope.goTo('Monthly Digest');
                                }, function errorCallback(response){
                                    console.log('error : ' + JSON.stringify(response));
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
                        console.log('error : ' + JSON.stringify(response));
                    } 
                });
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
                console.log("not_authorized")
                
            } else {
                // The person is not logged into Facebook, so we're not sure if
                // they are logged into this app or not.
                console.log("else")
            }
        }, {scope: 'public_profile, email, user_friends, publish_actions'});
    };
    
}]);

preppo.controller('CADailyUpdatesController', ['$scope', 'userService', '$http', 'dateToString', 'apiDomainName', '$location', '$route', function($scope, userService, $http, dateToString, apiDomainName, $location, $route) {
    $http.defaults.withCredentials = true;
    $scope.dateToString = dateToString;
    $scope.currentDate = new Date('2016-03-03');
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
            headers: {
                'Content-Type' : 'application/json',
                'x-session-token': "VJ-Zna13gVJg-b3Ty3g" //userService.userInfo.sessionToken
            },
            params: {
                'date': dateString
            }
        };
        var url = apiDomainName + "/news";
        $http.get(url, config).then(function successCallback(response) {
            if(response.data.length == 0) {
                var config = {
                    headers: {
                        'Content-Type' : 'application/json',
                        'x-session-token': "VJ-Zna13gVJg-b3Ty3g" //userService.userInfo.sessionToken
                    },
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
                    }
                }, function errorCallback(response) {
                    $scope.fetchingStatus = 4;
                });     
            }
            else {
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
    
    $scope.fetchData = function(date) {
        var dt = new Date(date.getTime());
        dt.setDate(dt.getDate() - 1);
        var prevDateString = dateToString.convert(dt);
        var dateString = dateToString.convert(date);
        $scope.fetchingStatus = 1;
        console.log("fetchInfo : " + JSON.stringify($scope.fetchInfo));
        $scope.fetchInfo[dateString].isLastDate = false;
        var config = {
            headers: {
                'Content-Type' : 'application/json'
            },
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
                if($scope.currentNews == $scope.newsUpdates.length) {
                    $scope.newsIndexToBeCompared[$scope.visible] = -1;
                    $scope.visible = ($scope.visible+1)/2;
                    $scope.newsIndexToBeCompared[$scope.visible] = $scope.currentNews;
                }
                $scope.newsUpdates = $scope.newsUpdates.concat(response.data);
                $scope.fetchInfo[prevDateString] = {
                    len : response.data.length,
                    total : $scope.fetchInfo[dateString].total + $scope.fetchInfo[dateString].len,
                    isLastDate : true
                };
            }
        }, function errorCallback(response) {
            $scope.errorDate = date;
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
                $scope.fetchData($scope.currentDate);
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
    
    $scope.prettify = function(str) {
        str = str.replace("&nbsp;", "");
        str = str.replace("<br>", "");
        str = str.replace("<br/>", "");
        str = str.replace("<br >", "");
        str = str.replace("<br />", "");
        return str;
    };
    
    $scope.getDateObj = function(str) {
        var dt = new Date(str);
        return dt;
    };
    
    $scope.refreshPage = function() {
        $route.reload();
    };
    
}]);

preppo.controller('CAMonthlyDigestController', ['$scope', 'userService', '$http', 'apiDomainName', '$location', '$window', function($scope, userService, $http, apiDomainName, $location, $window) {
    $scope.digests = [];
    $scope.classNames = ['class1', 'class2', 'class3', 'class4'];
    $scope.user = userService;
    $scope.fetched = false;
    
    function fetchData() {
        var config = {
            headers: {
                'Content-Type' : 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            }
        };
        var url = apiDomainName + "/news/monthlydigest";
        $http.get(url, config).then(function successCallback(response) {
            $scope.digests = response.data;
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
}]);

preppo.controller('CAQuizHomeController', ['$scope', 'userService', '$http', 'dateToString', '$location', 'apiDomainName', 'quizService', function($scope, userService, $http, dateToString, $location, apiDomainName, quizService) {
    $scope.fetchLimit = 3;
    $scope.quizzes = [];
    $scope.belowDataStatus = 0;     // 1-pending data 2-fetching data 3-fetched data. makes sense only when quizzes.length>0
    $scope.isLoading = false;
    $scope.dateToString = dateToString;
    $scope.user = userService;
    $scope.fetched = false;
    
    function fetchData() {
        var config = {
            headers: {
                'Content-Type' : 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            },
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
            headers: {
                'Content-Type' : 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            },
            params: {
                'limit': $scope.fetchLimit,
                'lt': dateString
            }
        };
        var url = apiDomainName + "/news/quiz";
        $http.get(url, config).then(function successCallback(response) {
            var quizzes = response.data;
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
            $scope.quizzes = $scope.quizzes.concat(quizzes);
        }, function errorCallback(response) {
            $scope.belowDataStatus = 1;
        });
    };
    
    $scope.fetchQuiz = function(index) {
        quizService.quiz = $scope.quizzes[index];
        $location.path('/currentAffairs/quiz/' + $scope.quizzes[index]._id);
    };
    
}]);

preppo.controller('CAQuizOfficeController', ['$scope', 'userService', '$http', '$routeParams', 'apiDomainName', 'quizService', '$window', '$location', function($scope, userService, $http, $routeParams, apiDomainName, quizService, $window, $location) {
    $scope.id = $routeParams.id;
    $scope.quiz = quizService.quiz;
    $scope.questions = [];
    $scope.currentQuestionIndex = 1;
    $scope.showNextButton = false;
    $scope.correctAnswers = 0;
    $scope.isLoading = false;
    $scope.showSummary = false;
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
            headers: {
                'Content-Type' : 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            }
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
        if(!$scope.showNextButton) {
            return;
        }
        if(nextOrFinish == "NEXT") {
            $scope.currentQuestionIndex++;
            $scope.showNextButton = false;
            $scope.resetQuestion();   
        }
        else {
            //kya karna hai      
        }
    };
    
    $scope.checkAnswer = function(index) {
        if(!$scope.showNextButton) {
            $scope.showNextButton = true;
            $scope.clickedIndex = index;
            if($scope.questionData.correctAnswer[$scope.user.userInfo.lang] == index) {
                $scope.correctAnswers++;
            }
        }
    };
    
    $scope.goBack = function() {
        $window.history.back();  
    };
    
}]);
