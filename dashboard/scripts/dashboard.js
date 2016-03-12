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

preppo.constant('apiDomainName', 'https://dev.api.preppo.in/v1/app');

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
        name: "",
        username: "",
        photo: "",
        sessionToken: ""
    };
    
    function setUserInfoFromCookie() {
        userInfo.name = $cookies.get('name');
        userInfo.username = $cookies.get('username');
        userInfo.photo = $cookies.get('photo');
        userInfo.sessionToken = $cookies.get('sessionToken');
        
        if(typeof(userInfo.sessionToken) != "undefined" && userInfo.sessionToken.length > 0) {
            userInfo.loggedIn = true;
        }
        
        return;
    }
    
    function setUserInfoAndCookie(name, username, photo, sessionToken) {
        userInfo.name = name;
        userInfo.username = username;
        userInfo.photo = photo;
        userInfo.sessionToken = sessionToken;
        userInfo.loggedIn = true;
        var date = new Date("October 13, 9999 11:13:00");
        $cookies.put('name', name, {expires: date});
        $cookies.put('username', username, {expires: date});
        $cookies.put('photo', photo, {expires: date});
        $cookies.put('sessionToken', sessionToken, {expires: date});
        return;
    }
    
    function clearUserInfoAndCookie() {
        $cookies.remove('name');
        $cookies.remove('username');
        $cookies.remove('photo');
        $cookies.remove('sessionToken');
        userInfo.loggedIn = false;
        userInfo.name = '';
        userInfo.username = '';
        userInfo.photo = '';
        userInfo.sessionToken = '';
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
        clearUserInfoAndCookie: clearUserInfoAndCookie,
        getFirstName: getFirstName
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
    $scope.goto = ""; //nowhere, Monthly Digest, Quiz
    //$scope.currentSubCategory = subCategories[$scope.currentCategory][0];
    
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
    
    /*-------------------------------------*/
    // Related to login/signup
    
    $scope.travel = function(dest) {
        if(userService.userInfo.loggedIn) {
            $scope.goTo(dest);
        }
        else {
            $scope.showLoginModal('login', dest);
        }
    };
    
    $scope.modalData = {
        signUp: {
            mobileNo: "",
            code: "",
            name: "",
            email: "",
            password: ""
        },
        login: {
            mobileNo: "",
            password: ""
        },
        type: 'signUp',
        step: 1
    };
    
    $scope.forgotPasswordModalData = {
        mobileNo: "",
        otp: "",
        password: "",
        step: 1
    };
    
    $scope.resetModalData = function(type) {
        $scope.modalData.signUp.mobileNo = "";
        $scope.modalData.signUp.code = "";
        $scope.modalData.signUp.name = "";
        $scope.modalData.signUp.password = "";
        $scope.modalData.signUp.email = "";
        $scope.modalData.login.mobileNo = "";
        $scope.modalData.login.password = "";
        $scope.modalData.type = type;
        $scope.modalData.step = 1;
    };
    
    $scope.resetForgotPasswordModalData = function() {
        $scope.forgotPasswordModalData.mobileNo = "";
        $scope.forgotPasswordModalData.otp = "";
        $scope.forgotPasswordModalData.password = "";
        $scope.forgotPasswordModalData.step = 1;
    };
    
    $scope.login = function(step) {
        $scope.loading = true;
        var data = {
            phone: $scope.modalData.login.mobileNo,
            password: $scope.modalData.login.password
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = apiDomainName + '/auth/login';
        $http.post(url, data, config).then(function successCallback(response) {
            var data = response.data;
            userService.setUserInfoAndCookie(data['user'].name, data['user'].username, (!data['user'].photo?"":data['user'].photo), data['x-session-token']);
            userService.setUserInfoFromCookie();
            $scope.loading = false;
            $scope.hideLoginModal();
            if($scope.goto != 'nowhere') {
                console.log("login hehe : " + $scope.goto);
                $scope.goTo($scope.goto);   
            }
        }, function errorCallback(response){
            $scope.loading = false;
            if(response.data.error == "INVALID_CREDENTIALS") {
                alert("Invalid password.");
            }
            else if(response.data.error == "USER_NOT_FOUND") {
                alert("User not found.");
            }
            else {
                console.log('error : ' + JSON.stringify(response));
            } 
        });
    };
    
    $scope.signUp = function(step) {
        if(step == 1) {
            $scope.loading = true;
            var data = {
                phone: $scope.modalData.signUp.mobileNo
            };
            var config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            var url = apiDomainName + '/auth/otp';
            $http.post(url, data, config).then(function successCallback(response) {
                var data = response.data;
                $scope.loading = false;
                $scope.modalData.step = 2; 
            }, function errorCallback(response){
                $scope.loading = false;
                console.log('error : ' + JSON.stringify(response));
            });
        }
        else if(step == 2) {
            $scope.modalData.step = 3;
        }
        else {
            $scope.loading = true;
            var data = {
                phone: $scope.modalData.signUp.mobileNo,
                otp: $scope.modalData.signUp.code,
                name: $scope.modalData.signUp.name,
                email: $scope.modalData.signUp.email,
                password: $scope.modalData.signUp.password
            };
            var config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            var url = apiDomainName + '/auth/signup';
            $http.post(url, data, config).then(function successCallback(response) {
                var data = response.data;
                userService.setUserInfoAndCookie(data['user'].name, data['user'].username, (!data['user'].photo?"":data['user'].photo), data['x-session-token']);
                userService.setUserInfoFromCookie();
                $scope.loading = false;
                $scope.hideLoginModal();
                if($scope.goto != 'nowhere') {
                    $scope.goTo($scope.goto);   
                }
            }, function errorCallback(response){
                $scope.loading = false;
                if(response.data.error == "USER_ALREADY_EXISTS") {
                    alert("User already exists.");
                }
                else if(response.data.error == "INVALID_OTP") {
                    alert("OTP incorrect.");
                }
                else {
                    console.log('error : ' + JSON.stringify(response));   
                }
            });
        } 
    };
    
    $scope.google = function(type, token) {
        var data = {
            googleToken: token
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = apiDomainName + '/auth/' + type;
        $http.post(url, data, config).then(function successCallback(response) {
            var data = response.data;
            userService.setUserInfoAndCookie(data['user'].name, data['user'].username, (!data['user'].photo?"":data['user'].photo), data['x-session-token']);
            userService.setUserInfoFromCookie();
            $scope.hideLoginModal();
            if($scope.goto != 'nowhere') {
                $scope.goTo($scope.goto);   
            }
        }, function errorCallback(response){
            console.log("error");
            if(response.data.error == "INVALID_TOKEN") {
                alert("Invalid token.");
            }
            else {
                console.log('error : ' + JSON.stringify(response));
            } 
        });
    };
    
    $scope.fb = function(type) {
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
                var url = apiDomainName + '/auth/' + type;
                $http.post(url, data, config).then(function successCallback(response) {
                    var data = response.data;
                    userService.setUserInfoAndCookie(data['user'].name, data['user'].username, (!data['user'].photo?"":data['user'].photo), data['x-session-token']);
                    userService.setUserInfoFromCookie();
                    $scope.hideLoginModal();
                    if($scope.goto != 'nowhere') {
                        $scope.goTo($scope.goto);   
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
        }, {scope: 'public_profile, email, user_friends'});
    };
    
    $scope.showLoginModal = function(type, goto) {
        $scope.resetModalData(type);
        $scope.goto = goto;
        $('#loginModal').modal('show');
    };
    
    $scope.hideLoginModal = function() {
        $('#loginModal').modal('hide');
    };
    
    $scope.showForgotPasswordModal = function() {
        $scope.resetForgotPasswordModalData();
        $('#forgotPasswordModal').modal('show');
    };
    
    $scope.hideForgotPasswordModal = function() {
        $('#forgotPasswordModal').modal('hide');
    };
    
    $scope.sendCode = function(phone) {
        var data = {
            phone: phone
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = apiDomainName + '/auth/otp';
        $http.post(url, data, config).then(function successCallback(response) {
            var data = response.data;
            console.log('data : ' + JSON.stringify(data));
        }, function errorCallback(response){
            console.log('error : ' + JSON.stringify(response));
        });
    };
    
    $scope.sendCodeForgotPasswordModal = function() {
        var data = {
            phone: $scope.forgotPasswordModalData.mobileNo
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = apiDomainName + '/auth/otp';
        $http.post(url, data, config).then(function successCallback(response) {
            $scope.forgotPasswordModalData.step = 2;
        }, function errorCallback(response){
            console.log('error : ' + JSON.stringify(response));
        });
    };
    
    $scope.verifyCodeForgotPasswordModal = function() {
        var data = {
            phone: $scope.forgotPasswordModalData.mobileNo,
            otp: $scope.forgotPasswordModalData.otp
        };
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var url = apiDomainName + '/auth/login';
        $http.post(url, data, config).then(function successCallback(response) {
            var data = response.data;
            userService.setUserInfoAndCookie(data['user'].name, data['user'].username, (!data['user'].photo?"":data['user'].photo), data['x-session-token']);
            $scope.forgotPasswordModalData.step = 3;
        }, function errorCallback(response){
            if(response.data.error == "INVALID_OTP") {
                alert("OTP incorrect.");
            }
            else if(response.data.error == "USER_NOT_FOUND") {
                alert("User not found.");
            }
            else {
                console.log('error : ' + JSON.stringify(response));
            }
        });
    };
    
    $scope.resetPassword = function() {
        var data = {
            password: $scope.forgotPasswordModalData.password
        };
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': userService.userInfo.sessionToken
            }
        };
        var url = apiDomainName + '/users/me';
        $http.put(url, data, config).then(function successCallback(response) {
            var data = response.data;
            alert("Password successfully reset");
            $scope.hideForgotPasswordModal();
        }, function errorCallback(response){
            if(response.data.error == "UNAUTHENTICATED") {
                alert("Unauthenticated.");
            }
            else if(response.data.error == "NOT_FOUND") {
                alert("User not found.");
            }
            else {
                console.log('error : ' + JSON.stringify(response));
            } 
        }); 
    };
    
    $scope.guyForgotPassword = function() {
        $('#loginModal').modal('hide');
        $scope.showForgotPasswordModal();
    };
    /*-------------------------------------*/
}]);

preppo.controller('CADailyUpdatesController', ['$scope', 'userService', '$http', 'dateToString', 'apiDomainName', 'viewingLang', function($scope, userService, $http, dateToString, apiDomainName, viewingLang) {
    $scope.viewingLang = viewingLang;
    $http.defaults.withCredentials = true;
    $scope.dateToString = dateToString;
    $scope.currentDate = new Date('2016-02-03');
    $scope.newsUpdates = [];
    $scope.fetchInfo = {};
    $scope.currentNews = 0;
    $scope.fetchingStatus = 1; // 0-failed, 1-fetching, 2-fetched, 3-finished. Used for showing last slide.
    $scope.newsIndexToBeCompared = 0;
    $scope.firstDate = new Date();
    $scope.user = userService;
    $scope.isSliding = false;
    
    $scope.logout = function() {
        $scope.$parent.loading = true;
        var url = apiDomainName + '/auth/logout';
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            }
        };
        $http.get(url, config).then(function successCallback(response){
            $scope.user.clearUserInfoAndCookie();
            $scope.$parent.loading = false;
        }, function errorCallback(response){
            console.log(JSON.stringify(response));
            $scope.$parent.loading = false;
        });
    };
    
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
                        $scope.newsIndexToBeCompared = $scope.currentNews;
                    }
                }, function errorCallback(response) {
                    $scope.fetchingStatus = 0;
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
                $scope.newsIndexToBeCompared = $scope.currentNews;
            }
        }, function errorCallback(response) {
            $scope.fetchingStatus = 4;
        });
    }
    start();
    
    $scope.goTo = function(subCat) {
        if(userService.userInfo.loggedIn) {
            $scope.$parent.goTo(subCat);
        }
        else {
            $scope.showLoginModal();
        }
    };
    
    $scope.fetchData = function(date) {
        
        var dt = new Date(date.getTime());
        dt.setDate(dt.getDate() - 1);
        var prevDateString = dateToString.convert(dt);
        var dateString = dateToString.convert(date);
        $scope.fetchingStatus = 1;
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
                    $scope.newsIndexToBeCompared = $scope.currentNews;  
                }
                $scope.newsUpdates = $scope.newsUpdates.concat(response.data);
                $scope.fetchInfo[prevDateString] = {
                    len : response.data.length,
                    total : $scope.fetchInfo[dateString].total + $scope.fetchInfo[dateString].len,
                    isLastDate : true
                };
            }
        }, function errorCallback(response) {
            $scope.fetchingStatus = 0;
        });
    };
    
    $scope.prev = function() {
        if($scope.isSliding) {
            return;
        }
        if($scope.currentNews == 0) {
            // Kuch nhi hoga bhai. bas kar
        }
        else {
            $('.carousel').carousel('prev');
            if($scope.currentNews == $scope.newsUpdates.length || $scope.currentNews == $scope.fetchInfo[dateToString.convert($scope.currentDate)].total) {
                $scope.currentDate.setDate($scope.currentDate.getDate() + 1);            
            }
            $scope.currentNews--;
        }
    };
    
    $scope.next = function() {
        if($scope.isSliding) {
            return;
        }
        if($scope.currentNews == $scope.newsUpdates.length) {
            // Kuch nhi hoga bhai. bas kar
        }
        else {
            $('.carousel').carousel('next');
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
        $scope.newsIndexToBeCompared = 0;
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
        console.log("here : " + str);
        var dt = new Date(str);
        console.log("dt : " + dt);
        return dt;
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
    
    $scope.logout = function() {
        $scope.$parent.loading = true;
        var url = apiDomainName + '/auth/logout';
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            }
        };
        $http.get(url, config).then(function successCallback(response){
            $scope.user.clearUserInfoAndCookie();
            $scope.$parent.loading = false;
            $location.path('/currentAffairs/dailyUpdates');
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            console.log(JSON.stringify(response));
        });
    };
    
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
    
    $scope.logout = function() {
        $scope.$parent.loading = true;
        var url = apiDomainName + '/auth/logout';
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            }
        };
        $http.get(url, config).then(function successCallback(response){
            $scope.user.clearUserInfoAndCookie();
            $scope.$parent.loading = false;
            $location.path('/currentAffairs/dailyUpdates');
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            console.log(JSON.stringify(response));
        });
    };
    
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

preppo.controller('CAQuizOfficeController', ['$scope', 'userService', '$http', '$routeParams', 'viewingLang', 'apiDomainName', 'quizService', '$window', '$location', function($scope, userService, $http, $routeParams, viewingLang, apiDomainName, quizService, $window, $location) {
    $scope.id = $routeParams.id;
    $scope.quiz = quizService.quiz;
    $scope.questions = [];
    $scope.currentQuestionIndex = 1;
    $scope.showNextButton = false;
    $scope.correctAnswers = 0;
    $scope.viewingLang = viewingLang.current;
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
    
    $scope.logout = function() {
        $scope.$parent.loading = true;
        var url = apiDomainName + '/auth/logout';
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': $scope.user.userInfo.sessionToken
            }
        };
        $http.get(url, config).then(function successCallback(response){
            $scope.user.clearUserInfoAndCookie();
            $scope.$parent.loading = false;
            $location.path('/currentAffairs/dailyUpdates');
        }, function errorCallback(response){
            $scope.$parent.loading = false;
            console.log(JSON.stringify(response));
        });
    };
    
    function resetQuestion() {
        var question = $scope.questions[$scope.currentQuestionIndex - 1];
        var langs = viewingLang.langs;
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
            if($scope.questionData.correctAnswer[viewingLang.current] == index) {
                $scope.correctAnswers++;
            }
        }
    };
    
    $scope.goBack = function() {
        $window.history.back();  
    };
    
}]);
