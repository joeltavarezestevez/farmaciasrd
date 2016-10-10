angular.module('farmaciasrd.controllers', [])

.controller('AppCtrl', function($scope, $localStorage, $state) {
    
    $scope.cerrarSesion = function () {
        $localStorage.deleteObject('userinfo');
        $state.go('login');
    }   
    
})

.controller('MapaCtrl', function($scope, $ionicPlatform, $http, $rootScope, $timeout, $ionicLoading, $cordovaGeolocation, $cordovaToast, $ionicSideMenuDelegate) {
    
    $scope.results = [];
    $rootScope.map;
    $rootScope.distances = [];
    $rootScope.times = [];
    $scope.distance_details;
    $scope.time_details
    $scope.destination;
    var position = new google.maps.LatLng(19.4959999,-70.7099472);
    $rootScope.location = position;
    
    function initialize() {
        var location =  $rootScope.location;
        $rootScope.location = location;
        //console.log($rootScope.position.lat());
        
        var loadingOptions = {
            content: 'Cargando...',
            animation: 'fade-in',
            showBackdrop: true,
            template: '<ion-spinner></ion-spinner> Obteniendo ubicación actual...',
            maxWidth: 300,
            showDelay: 0
        };
        
        var locationOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        $ionicLoading.show(loadingOptions);
        
        $cordovaGeolocation.getCurrentPosition(locationOptions)
            .then(function(pos) {
                //console.log("Getting Location...");
                $rootScope.location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
                $ionicLoading.hide();
                //alert("Location Found: " + $scope.location.lat() + ", " + $scope.location.lng());
                var mapOptions = {
                  center: $rootScope.location,
                  zoom: 14,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                };        
        
                $rootScope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
                //Wait until the map is loaded
                google.maps.event.addListenerOnce($rootScope.map, 'idle', function(){            
                    $rootScope.markerLocation = new google.maps.Marker({
                        map: $rootScope.map,
                        position: $rootScope.location,
                        icon: 'img/LOCATION.png'
                    });

                    var service = new google.maps.places.PlacesService($scope.map);

                    service.nearbySearch({
                        location: $rootScope.location,
                        //radius: 50000,
                        rankBy: google.maps.places.RankBy.DISTANCE,
                        types: ['pharmacy']
                    }, callback);
        
                    $ionicLoading.show({template: '<ion-spinner></ion-spinner> Buscando farmacias cercanas...'});
        
                    function callback(results, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            var places = results;
                            $rootScope.results = places;
                            console.log(places);

                            var infowindow = new google.maps.InfoWindow();

                            for (var i = 0; i < $rootScope.results.length; i++) {
                                var placeLoc = $rootScope.results[i].geometry.location;
                                $scope.placeLoc = placeLoc;
                                var image = 'img/drugstore-icon.png';

                                var marker = new google.maps.Marker({
                                    map: $rootScope.map,
                                    position: $scope.placeLoc,
                                    icon:image
                                });

                                $scope.destination = new google.maps.LatLng($rootScope.results[i].geometry.location.lat(),$rootScope.results[i].geometry.location.lng());

                                var service2 = new google.maps.DistanceMatrixService();

                                service2.getDistanceMatrix({
                                    origins: [$rootScope.location],
                                    destinations: [$scope.destination],
                                    travelMode: google.maps.TravelMode.DRIVING,
                                }, callback);

                                function callback(response, status) {
                                  // See Parsing the Results for
                                  // the basics of a callback function.
                                    $scope.distance_results = response.rows[0].elements[0].distance.text;
                                    $scope.time_results = response.rows[0].elements[0].duration.text;
                                    $scope.distances.push($scope.distance_results);
                                    $scope.times.push($scope.time_results);                    
                                }                             

                                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                                    return function() {
                                        //contenido del infowindow con informacion del chofer                          
                                        var contentString = 
                                        '<div id="content" class="list">'+
                                            '<div class="item item-thumbnail-left" href="#">'+
                                                '<img src="img/drugstore.png" class="center">'+
                                                '<h2>' + places[i].name + '</h2>'+
                                                '<p>' + places[i].vicinity + '</p>'+
                                                '<p><a href="#/tab/farmacias/' + places[i].place_id + '"> Ver Detalles </a></p>'+
                                                '<p><strong class="positive">' + $scope.times[i] + ' - ' + $scope.distances[i] + '</strong></p>'+
                                            '</div>'+    
                                        '</div>';                              
                                        //Set contenido del infowindow
                                        infowindow.setContent(contentString);
                                        //Abrir el infowindow
                                        infowindow.open($rootScope.map, marker);
                                    }
                                })(marker, i));                    
                            }
                        }
                        $ionicLoading.hide();
                        //alert("Location End " + $scope.location.lat() + ", " + $scope.location.lng());
                    }
                })
            },
            function(error) {
                $cordovaToast
                .show('Error al obtener posición actual. \nCode Error: ' + error.code + ' \nMessage: ' + error.message, 'long','bottom')
                .then(function(success) {
                  // success
                    $timeout(function() {
                      ionic.Platform.exitApp();
                    }, 4000); 
                }, function (error) {
                  // error
                });
                $ionicLoading.hide();
            },locationOptions);                      
    };
    
    $ionicPlatform.ready(initialize);
    
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }    
})

.controller('FarmaciasCtrl', function($scope, $http, $rootScope, $ionicLoading, $ionicSideMenuDelegate) {
    // Setup the loader
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    template: '<ion-spinner></ion-spinner> Cargando datos ...',
    maxWidth: 300,
    showDelay: 0
  });
    
    $scope.init = function() {    
        $scope.results = $rootScope.results;
        //console.log($rootScope.times);
        //console.log($rootScope.distances);
        $ionicLoading.hide();
    }
    
    $scope.init();  
    
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }        
    
})

.controller('FarmaciaDetalleCtrl', function($scope, $rootScope, $ionicPlatform, $stateParams, $http, $window, $state, $cordovaGeolocation, $ionicSideMenuDelegate, $ionicHistory) {

    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }   
    
    $scope.goBack = function(){
        console.log('going back...');
        //$ionicHistory.goBack();
        $state.go('tab.farmacias');
    }
    var locationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };
    
    function initialize () {                   
        $cordovaGeolocation.getCurrentPosition(locationOptions)
            .then(function(pos) {
                //console.log("Getting Location...");
                $rootScope.location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        
            var url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + $stateParams.Id + "&key=AIzaSyB1Td_pMED3L7rLo_EBKFf3orhjoQE3wHE&";
            //Crear una peticion tipo http.GET al api mitaxird para consultar los usuarios.
            $http.get(url).success(function(details) {
                //Si la consulta fue satisfactoria, cargar los usuarios en el objeto usuarios (En el template se muestran en un listado).
                $scope.details = details;
                console.log($scope.details);
                console.log("Origin: " + $rootScope.location);
                console.log("Destination: " + $scope.details.result.geometry.location.lat + ", " + $scope.details.result.geometry.location.lng);
                // Assign a five-star rating to the hotel, using a black star ('&#10029;')
                // to indicate the rating the hotel has earned, and a white star ('&#10025;')
                // for the rating points not achieved.
                if ($scope.details.result.rating) {
                    var ratingHtml = '';
                    for (var i = 0; i < 5; i++) {
                        if ($scope.details.result.rating < (i + 0.5)) {
                            ratingHtml += '&#10025;';
                        } else {
                            ratingHtml += '&#10029;';
                        }
                        document.getElementById('rating').innerHTML = ratingHtml;
                    }
                }
                console.log(ratingHtml);
                
                $scope.destination = new google.maps.LatLng($scope.details.result.geometry.location.lat,$scope.details.result.geometry.location.lng);

                var service2 = new google.maps.DistanceMatrixService();

                service2.getDistanceMatrix({
                    origins: [$rootScope.location],
                    destinations: [$scope.destination],
                    travelMode: google.maps.TravelMode.DRIVING,
                }, callback);

                function callback(response, status) {
                  // See Parsing the Results for
                  // the basics of a callback function.
                    $scope.distance_details = response.rows[0].elements[0].distance.text;
                    $scope.time_details = response.rows[0].elements[0].duration.text;                  
                    console.log($scope.distance_details + " - " + $scope.time_details);
                    $scope.$apply();
                }

                if($scope.details.result.photos)
                {
                    $scope.photo_url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=4000&photoreference="+$scope.details.result.photos[0].photo_reference+"&key=AIzaSyB1Td_pMED3L7rLo_EBKFf3orhjoQE3wHE";   
                }
            })
        })
    }
    
    $scope.call = function(phone) {
        var telephone = phone;
        telephone = telephone.replace(' ', '');
        try {
            $window.open(telephone, '_system', 'location=no');
        } catch (err) {
            alert(err);
        }
    }
    
    $scope.link = function(website) {   
        try {
            $window.open(website, '_system', 'location=no');
        } catch (err) {
            alert(err);
        }
    }
    
    $scope.map = function(maplink) {
        try {
            $window.open(maplink, '_system', 'location=no');
        } catch (err) {
            alert(err);
        }
    }
    
    $scope.pedido = function(){
        $rootScope.FarmaciaId = $stateParams.Id;
        $rootScope.FarmaciaNombre = $scope.details.result.name;
        $state.go('pedidos');
    }
    
    $ionicPlatform.ready(initialize);
})

.controller('ConfiguracionCtrl', function($scope, $ionicSideMenuDelegate) {
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }   
})

.controller('HistorialPedidosCtrl', function($scope, $ionicSideMenuDelegate, $state, $localStorage) {
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }   
    
    $scope.data = $localStorage.getObject('userinfo','{}');
    console.log($scope.data);
    //$scope.$apply();
    if(Object.keys($scope.data).length === 0){
        $state.go('login');
    }
})

.controller('AcercadeCtrl', function($scope, $ionicSideMenuDelegate, $ionicPlatform) {
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }
    $ionicPlatform.ready(function() {
           
    })
})
.controller('PedidosCtrl', function($scope, $rootScope, $ionicPlatform, $cordovaCamera, $timeout, $cordovaToast, $ionicLoading, $ionicHistory, $ionicSideMenuDelegate) {

    $ionicPlatform.ready(function() {
        /*if($rootScope.FarmaciaId != null){
            alert($rootScope.FarmaciaId + " " + $rootScope.FarmaciaNombre);
        }*/
        
        $scope.takePhoto = function (id) {
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                //allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                if (id == 1){
                    $scope.imgdocumento = "data:image/jpeg;base64," + imageData;
                }
                else if (id == 2) {
                    $scope.imgreceta = "data:image/jpeg;base64," + imageData;                       
                }
                else if (id == 3) {
                    $scope.imgseguro = "data:image/jpeg;base64," + imageData;                       
                }
            }, function (err) {
                // An error occured. Show a message to the user
            });
        }

        $scope.choosePhoto = function (id) {
              var options = {
                quality: 100,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                //allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                if (id == 1){
                    $scope.imgdocumento = "data:image/jpeg;base64," + imageData;
                }
                else if (id == 2) {
                    $scope.imgreceta = "data:image/jpeg;base64," + imageData;                       
                }
                else if (id == 3) {
                    $scope.imgseguro = "data:image/jpeg;base64," + imageData;                       
                }
            }, function (err) {
                // An error occured. Show a message to the user
            });
        }   
    })
    
    $scope.choice='A';
    
    $scope.goBack = function() {
        $ionicHistory.goBack();
    }
    
    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }    
    $scope.pedido = function() {
        // Setup the loader
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            template: '<ion-spinner></ion-spinner> Enviando Pedido...',
            maxWidth: 300,
            showDelay: 0
        })
        
        $timeout(function(){
            $cordovaToast.show('Pedido Enviado Correctamente!', 'long','bottom')
            .then(function(success) {
                // success
                $ionicLoading.hide();
            }, function (error) {
                // error
            })
        },2000);  
    }
})

//Controlador del Login
.controller('LoginCtrl', function ($scope, $state, $rootScope, $ionicHistory, $localStorage) {
    if(Object.keys($localStorage.getObject('userinfo','{}')).length != 0){
        $scope.data = $localStorage.getObject('userinfo','{}');
    }
    else {
        $scope.data = {};
    }
    console.log($scope.data);
    $scope.login = function () {
      if ($scope.data.username == "joel" && $scope.data.password == "despro"){
          $localStorage.storeObject('userinfo',$scope.data.username);
          $state.go('tab.mapa');
      } 
      else{
        $rootScope.showAlert('Error', 'Verifique su nombre de usuario y contraseña!', 'login');
      }
    }
    
    $scope.createAccount = function (){
      $ionicHistory.nextViewOptions({
        disableBack: true
      });      
      $state.go('crearCuenta');
    }
})

.controller('CrearCuentaCtrl', function($scope, $http, $location, $rootScope, $state, $ionicPopup, $ionicHistory) {
  //Declarar array usuarios.
  $scope.usuarios = [];
  //Declarar objeto usuario.
  $scope.usuario = {};

  $scope.myGoBack = function() {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });     
    $state.go('login');
  };
 /*
  * Metodo createAccount() - Sirve para almacenar un usuario en la BD.
  */
  $scope.createAccount = function() {
    //Crear una peticion tipo http.POST al api mitaxird para guardar el usuario con el objeto $scope.usuario (datos del usuario) como parametro.
    $http.post('http://104.219.53.200/api/usuarios', $scope.usuario)
      .success(function(data){
        //Si se creó correctamente, agregar el usuario creado al array usuarios.
        $scope.usuarios.push(data);
        //Limpiar el objeto usuario.
        $scope.usuario = {};
        //Con el metodo showAlert mostrar un Popup indicando que el usuario se ha creado correctamente.
        $rootScope.showAlert('Usuarios', 'Usuario Creado Correctamente!', 'tab');
      })
      .error(function (error, status){

        console.log(error);
        $scope.mensaje = '<div class="messages"> Errores al crear el registro: <br> </div>';

        if(error.tercero_nombre == 'El elemento tercero nombre ya está en uso.'){
          $scope.mensaje = $scope.mensaje + "<li><strong> Ya existe una cuenta con este nombre. </strong></li>";
        }
        if(error.tercero_nombre == 'El campo tercero nombre es obligatorio'){
          $scope.mensaje = $scope.mensaje + "<li><strong> El nombre debe tener al menos 6 caracteres. </strong></li>>";
        }
        if(error.usuario_nombre == 'El elemento usuario nombre ya está en uso.'){
          $scope.mensaje = $scope.mensaje + "<li><strong> Este correo ya está en uso. </strong></li>";
        }                                
        if(error.usuario_nombre == 'El campo usuario nombre es obligatorio'){
          $scope.mensaje = $scope.mensaje + "<li><strong> El usuario debe tener al menos 6 caracteres. </strong></li>";
        }                
        if(error.usuario_nombre == 'El campo usuario nombre no corresponde con una dirección de e-mail válida.'){
          $scope.mensaje = $scope.mensaje + "<li><strong> Este usuario no corresponde con una dirección de e-mail válida. </strong></li>";
        }
        if(error.usuario_password == 'El campo confirmación de usuario password no coincide.'){
          $scope.mensaje = $scope.mensaje + "<li><strong> Las contraseñas no coinciden. </strong></li>";
        }
        if(error.usuario_password == 'El campo usuario password es obligatorio'){
          $scope.mensaje = $scope.mensaje + "<li><strong> La contraseña debe tener al menos 6 caracteres. </strong></li>";
        }
        if(error.tercero_telefono == 'El campo tercero telefono es obligatorio'){
          $scope.mensaje = $scope.mensaje + "<li><strong> Debe indicar su número de teléfono. </strong></li>";
        }
        if(error.tercero_telefono == 'El campo tercero telefono debe contener al menos 14 caracteres.'){
          $scope.mensaje = $scope.mensaje + "<li><strong> Número de teléfono inválido. </strong></li>";
        }
        $rootScope.showAlert('Usuarios', $scope.mensaje , 'createAccount');         
      });       
  };
});
