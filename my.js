//підлючаємо ангуляр
const app = angular.module('app', []);

const link = 'http://localhost:8000';
setInterval(function(){
    if(!navigator.onLine){
        var interval = setInterval(function(){
            if(navigator.onLine){
                clearInterval(interval);
                window.location=window.location;
            }

        },1000);
    }
},1000)
//контролер відгуків
app.controller('Ctrl', function($scope, $http){
	if(location.href == link+'/reviews.html'){
		//перевірка на онлайн
		if(navigator.onLine){
			//пост запит на отримання відгуків
			$http.post(link + '/read-reviews')
				.then(function successCallback(response) {
				//отримали відгуки
				$scope.reviews = response.data;
				//перевірка чи є щось нове локалсторедж
				if($scope.reviews.length < localStorage.getItem('reviewslength')){
					for(i = $scope.reviews.length-1; i<localStorage.getItem('reviewslength'); i++){
						var obj = {};
						obj.name = localStorage.getItem('name'+i);
						obj.date = localStorage.getItem('date'+i);
						obj.text = localStorage.getItem('text'+i);
						//надсилаємо новий відгук з локалсторедж
						$http.post(link + '/addreviews', obj)
						.then(function successCallback(response) {
							
						 if(i == parseInt(localStorage.getItem('reviewslength'))-1){
							 //оновлюємо відгуки
							 $http.post(link + '/read-reviews')
								.then(function successCallback(response) {
								 //отримали відгуки
									$scope.reviews = response.data;
								 //відсилаємо їх в локалсторедж
									localStorage.setItem('reviewslength', $scope.reviews.length);
									for(var i = 0; i<$scope.reviews.length; i++){
										localStorage.setItem('name'+i, $scope.reviews[i].name);
										localStorage.setItem('date'+i, $scope.reviews[i].date);
										localStorage.setItem('text'+i, $scope.reviews[i].text);
									}
							}, function errorCallback(response) {
								console.log("ERROR!! "+response.error);
							});
						 }
						}, function errorCallback(response) {
							console.log("Error!!!" + response.err);
						});
					}
					
				}else{
					//відсилаємо в локалсторедж відгуки
					localStorage.setItem('reviewslength', $scope.reviews.length);
					for(var i = 0; i<$scope.reviews.length; i++){
						localStorage.setItem('name'+i, $scope.reviews[i].name);
						localStorage.setItem('date'+i, $scope.reviews[i].date);
						localStorage.setItem('text'+i, $scope.reviews[i].text);
					}
				}
				
			}, function errorCallback(response) {
				console.log("ERROR!! "+response.error);
			});
			
		}else{
			// це виконається якщо офлайн
			$scope.reviews = [];
			//дістаємо дані з локалсторедж
			for(var i = 0; i<localStorage.getItem('reviewslength'); i++){
				var obj = {};
				obj.name = localStorage.getItem('name'+i);
				obj.date = localStorage.getItem('date'+i);
				obj.text = localStorage.getItem('text'+i);
				$scope.reviews.push(obj);
			}
		}
		//кнопка яка додає відгук
	$('#send').on("click", function(){
		//дістаємо дані з rev
		var review = $('#rev').val();
		// робота з датою
		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var day = date.getDate();
		var month = date.getMonth()+1;
		var year = date.getFullYear();
		year = year.toString();
		year = year.slice(2, 4);
		//фунція котра додає нулі
		function addNull(x){
			x = x.toString();
			if(x.length < 2){
				x = '0'+x;
			}
			return x;
		}
		hours = addNull(hours);
		minutes = addNull(minutes);
		day = addNull(day);
		month = addNull(month);
		var fullDate = day+'.'+month+'.'+year+', '+hours+':'+minutes;
		if(review != ''){
			//перевірка на онлайн
			if(navigator.onLine){
				 let obj = {
                    name: 'Вася Пупкін',
					date: fullDate,
					text: review
                };
				// пост запит який додає відгук
                $http.post(link + '/addreviews', obj)
					.then(function successCallback(response) {
					//пост запит який оновлює відгуки
					$http.post(link + '/read-reviews')
						.then(function successCallback(response) {
							$scope.reviews = response.data;
							//відсилаємо відгуки в локалсторедж
							localStorage.setItem('reviewslength', $scope.reviews.length);
							for(var i = 0; i<$scope.reviews.length; i++){
								localStorage.setItem('name'+i, $scope.reviews[i].name);
								localStorage.setItem('date'+i, $scope.reviews[i].date);
								localStorage.setItem('text'+i, $scope.reviews[i].text);
							}
					}, function errorCallback(response) {
						console.log("ERROR!! "+response.error);
					});
				}, function errorCallback(response) {
                    console.log("Error!!!" + response.err);
                });
			}else{
				//якщо офлайн то відгуки додаються в локасторедж
				var indexOfReviews = localStorage.getItem('reviewslength');
				var indexOfReviews = parseInt(indexOfReviews);
				
				localStorage.setItem('name'+indexOfReviews, 'Вася Пупкін');
				localStorage.setItem('date'+indexOfReviews, fullDate);
				localStorage.setItem('text'+indexOfReviews, review);
				localStorage.setItem('reviewslength' , indexOfReviews+1);
				
				$scope.reviews = [];
				//оновлюємо відгуки з локалсторедж
				for(var i = 0; i<localStorage.getItem('reviewslength'); i++){
					var obj = {};
					obj.name = localStorage.getItem('name'+i);
					obj.date = localStorage.getItem('date'+i);
					obj.text = localStorage.getItem('text'+i);
					$scope.reviews.push(obj);
				}
				$scope.$apply();
				
			}
			$('#rev').val('');
		}
		
	})
	}
	});
//контролер новин
app.controller('newsCtrl', function($scope, $http){

	//перевірка на онлайн
	if(navigator.onLine){
		//пост запит який дістає новини
			$http.post(link + '/read-news')
				.then(function successCallback(response) {
				$scope.newsarr = response.data;
				if($scope.newsarr.length < localStorage.getItem('newslength')){
					for(i = $scope.newsarr.length; i<localStorage.getItem('newslength'); i++){
						var obj = {};
						obj.headline = localStorage.getItem('headline');
						obj.text = localStorage.getItem('textn');
						//надсилаємо нову новину з локалсторедж
						$http.post(link + '/addnews', obj)
							.then(function successCallback(response) {
							var cId=response.data;
							console.log(cId[0].id);
							cId = cId[0].id;
							//додає картинку
//							if($scope.myFile != undefined){
								var fd = localStorage.getItem('img');

								//це додає шлях до картинки в бд
								$http.post(link + '/addnameofimg'+ cId).then(function successCallback(response) {
									//а це додає картинку в папку
									$http.post(link + '/images', fd, {
										transformRequest: angular.identity
										, headers: {
											'Content-Type': undefined
										}
									}).then(function successCallback() {
										console.log("Uploaded!");
										$http.post(link + '/read-news')
										.then(function successCallback(response) {
										$scope.newsarr = response.data;
											localStorage.setItem('newslength', $scope.newsarr.length);
											for(var i = 0; i<$scope.newsarr.length; i++){
												localStorage.setItem('img'+i, $scope.newsarr[i].img);
												localStorage.setItem('headline'+i, $scope.newsarr[i].headline);
												localStorage.setItem('textn'+i, $scope.newsarr[i].text);
											}
										}, function errorCallback(response) {
											console.log("ERROR!! "+response.error);
										});
//										$('#addZag').val('');
//										$('#addN1').val('');
//										$('#addN2').val('');
//										tmppath="";
//										$('#inputFile').val("");
//										alert('Вашу новину успішно опубліковано!!!');
									}, function errorCallback(response) {
										console.log("Error!!!" + response.err);
									});
								}, function errorCallback(response) {
									console.log("Error!!!" + response.err);
								});
//							}
						}, function errorCallback(response) {
							console.log("Error!!!" + response.err);
						});
					}
					
				}else{
					localStorage.setItem('newslength', $scope.newsarr.length);
					for(var i = 0; i<$scope.newsarr.length; i++){
						localStorage.setItem('img'+i, $scope.newsarr[i].img);
						localStorage.setItem('headline'+i, $scope.newsarr[i].headline);
						localStorage.setItem('textn'+i, $scope.newsarr[i].text);
					}
				}
				
			}, function errorCallback(response) {
				console.log("ERROR!! "+response.error);
			});
			
		}else{
			$scope.newsarr = [];
			//дістаємо дані з локалсторедж
            var lll = parseInt(localStorage.getItem('newslength'))-1
            if(localStorage.getItem('textn'+lll) == null){
                for(var i = 0; i<lll; i++){
                    var obj = {};
                    obj.name = localStorage.getItem('img'+i);
                    obj.headline = localStorage.getItem('headline'+i);
                    obj.text = localStorage.getItem('textn'+i);
                    $scope.newsarr.push(obj);
                }
            }else{
                for(var i = 0; i<localStorage.getItem('newslength'); i++){
                    var obj = {};
                    obj.name = localStorage.getItem('img'+i);
                    obj.headline = localStorage.getItem('headline'+i);
                    obj.text = localStorage.getItem('textn'+i);
                    $scope.newsarr.push(obj);
                }
            }
		}

})
//контролер додавання новин
app.controller('addNewsCtrl', function($scope, $http){
	var tmppath = "";
	//подія на аплоад файлів
	inputFile.onchange =function(event){
		tmppath=URL.createObjectURL(event.target.files[0]);		
	}
	// подія на кнопці
	$('#sendNews').on('click', function(){
		//дістаємо значення
		var zag = $('#addZag').val();
		var n1 = $('#addN1').val();
		var n2 = $('#addN2').val();
		//перевірка для кожного значення
		if(zag == ''){
			$('.errorZag').html('')
			$('.errorZag').append('No text')
		}else{
			$('.errorZag').html('')
		}
		if(tmppath == ""){
			$('.errorImg').html('')
			$('.errorImg').append('No image')
		}else{
			$('.errorImg').html('')
		}
		if(n1 == ""){
			$('.errorN1').html('')
			$('.errorN1').append('No text')
		}else{
			$('.errorN1').html('')
		}
		if(n2 == ""){
			$('.errorN2').html('')
			$('.errorN2').append('No text')
		}else{
			$('.errorN2').html('')
		}
		//кінцева перевірка і очищення полів 
		if(zag != '' && n1 != '' && n2 != '' && tmppath != ''){
			var obj = {
				headline: zag,
				text: n2
			}
			if(navigator.onLine){
			//пост запит відправляє в бд новину
			$http.post(link + '/addnews', obj)
				.then(function successCallback(response) {
				var cId=response.data;
				console.log(cId[0].id);
				cId = cId[0].id;
				//додає картинку
				if($scope.myFile != undefined){
					var fd = new FormData();
					fd.append(cId, $scope.myFile);

					//це додає шлях до картинки в бд
					$http.post(link + '/addnameofimg'+ cId).then(function successCallback(response) {
						//а це додає картинку в папку
						$http.post(link + '/images', fd, {
							transformRequest: angular.identity
							, headers: {
								'Content-Type': undefined
							}
						}).then(function successCallback() {
							console.log("Uploaded!");
							$('#addZag').val('');
							$('#addN1').val('');
							$('#addN2').val('');
							tmppath="";
							$('#inputFile').val("");
							alert('Вашу новину успішно опубліковано!!!');
						}, function errorCallback(response) {
							console.log("Error!!!" + response.err);
						});
					}, function errorCallback(response) {
						console.log("Error!!!" + response.err);
					});
				}
			}, function errorCallback(response) {
				console.log("Error!!!" + response.err);
			});
			}else{
				if($scope.myFile != undefined){
					var newimg = parseInt(localStorage.getItem('newslength'))+1;
					
					var fd = new FormData();
					fd.append(newimg, $scope.myFile);
					localStorage.setItem('img', fd);
					localStorage.setItem('headline', obj.headline);
					localStorage.setItem('textn', obj.text);
					localStorage.setItem('newslength', newimg)
					alert("Вашу новину закинуто в localStorage!");
				}
			}
			
		}
	})
})
$(document).ready(function() {
	//перевірка на офлайн в якій заміняються силки на еррор.хтмл	
	if(!navigator.onLine){
		for(var i=0; i<document.getElementsByTagName('a').length; i++){
			var k = document.getElementsByTagName('a')[i].getAttribute('href');
			if(k=='news.html' || k=='contacts.html' || k=='reviews.html' || k=='index.html'){
				
			}else{
				document.getElementsByTagName('a')[i].setAttribute('href', 'error.html');
			}
			
		}
	}
	$('.btn_back').on("click", function(){
		window.location = 'http://localhost:8000/index.html'
	})

});
// директива яка парсить файл(зображення)
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A'
        , link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

