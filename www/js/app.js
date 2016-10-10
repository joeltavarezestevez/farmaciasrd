// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('farmaciasrd', ['ionic', 'ngCordova', 'farmaciasrd.controllers', 'farmaciasrd.services'])

.run(function($ionicPlatform, $rootScope, $ionicPopup, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if(ionic.Platform.isAndroid()){
        admobid = { 
            // for Android
            banner: 'ca-app-pub-2915919069891811/5874247999'
        };
    }
    if(AdMob)
      AdMob.createBanner({
          adId: admobid.banner, 
          adSize:AdMob.SMART_BANNER,
          position:AdMob.AD_POSITION.BOTTOM_CENTER,
          autoShow:true
      });        
  });
  /*
  * Método global showAlert() - Muestra un Alert Dialog()
  * @parametro: string $popupTitle - Titulo del mensaje.
  * @parametro: string $popupMessage - Contenido del mensaje.
  * @parametro: string $routeState - State donde envia al salir del mensaje.
  */
  $rootScope.showAlert = function(popupTitle, popupMessage, routeState) {
     var alertPopup = $ionicPopup.alert({
       title: 'FarmaciasRD | ' + popupTitle,
       template: popupMessage
     });
     alertPopup.then(function(res) {
       $state.go(routeState);
     });
   };
  /*
  * Método global cancelAlert() - Muestra un Confirm Dialog()
  * @parametro: string $popupTitle - Titulo del mensaje.
  * @parametro: string $yesroute - State donde envia si confirma la accion del mensaje.
  */
   $rootScope.cancelAlert = function(popupTitle, yesRoute) {
       var confirmPopup = $ionicPopup.confirm({
         title: 'FarmaciasRD | ' + popupTitle,
         template: 'Esta seguro que desea cancelar esta acción?'
       });
       confirmPopup.then(function(res) {
         if(res) {
          $state.go(yesRoute);
         }
         else{
          return;
         }
       });
   }; 
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'index.html',
    controller: 'AppCtrl'
  })
  
  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.mapa', {
    url: '/mapa',
    views: {
      'tab-mapa': {
        templateUrl: 'templates/tab-mapa.html',
        controller: 'MapaCtrl'
      }
    }
  })

  .state('tab.farmacias', {
      url: '/farmacias',
      views: {
        'tab-farmacias': {
          templateUrl: 'templates/tab-farmacias.html',
          controller: 'FarmaciasCtrl'
        }
      }
    })
    .state('tab.farmacia-detalle', {
      url: '/farmacias/:Id',
      views: {
        'tab-farmacias': {
          templateUrl: 'templates/farmacia-detalle.html',
          controller: 'FarmaciaDetalleCtrl'
        }
      }
    })

    //Ruta del formulario para crear usuarios
  .state('crearCuenta', {
    url: '/crearCuenta',
    templateUrl: 'templates/crearcuenta.html',
    controller: 'CrearCuentaCtrl'    
  })
  
      //Ruta del formulario para crear usuarios
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'    
  })
  
  .state('pedidos', {
    url: '/pedidos',
    templateUrl: 'templates/tab-pedidos.html',
    controller: 'PedidosCtrl'
  })
  
  .state('configuracion', {
    url: '/configuracion',
    templateUrl: 'templates/configuracion.html',
    controller: 'ConfiguracionCtrl'
  })
  
  .state('historialpedidos', {
    url: '/historialpedidos',
    templateUrl: 'templates/pedidos.html',
    controller: 'HistorialPedidosCtrl'
  })
  
  .state('acercade', {
    url: '/acercade',
    templateUrl: 'templates/acercade.html',
    controller: 'AcercadeCtrl'
  });  

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/mapa');

})

.directive('locationSuggestion', function($ionicModal, LocationService, $rootScope){
  return {
    restrict: 'A',
    scope: {
      location: '='
    },
    link: function($scope, element){
      console.log('locationSuggestion started!');
      $scope.search = {};
      $scope.search.suggestions = [];
      $scope.names = [];
      $scope.search.query = "";
      $ionicModal.fromTemplateUrl('templates/location.html', {
        scope: $scope,
        focusFirstInput: true
      }).then(function(modal) {
        $scope.modal = modal;
      });
      element[0].addEventListener('focus', function(event) {
        $scope.open();
      });
      $scope.$watch('search.query', function(newValue) {
        if (newValue) {
          LocationService.searchAddress(newValue).then(function(result) {
            $scope.search.error = null;
            $scope.search.suggestions = result;
            for(var c = 0; c < result.length; c++){
              console.log(c + '-');
               console.log(result[c].terms[0]);
            }
          }, function(status){
            $scope.search.error = "There was an error :( " + status;
          });
          $scope.names = [];
        };
        $scope.open = function() {
          $scope.modal.show();
        };
        $scope.close = function() {
          $scope.modal.hide();
        };
        $scope.choosePlace = function(place) {
          LocationService.getDetails(place.place_id).then(function(location) {
            //document.getElementById("address").innerHTML = '<strong class="uppercase" >' + location.name + '</strong> <br>' +location.formatted_address;          
            $scope.location = location;
            $scope.close();
            $rootScope.loc=true;
            console.log($rootScope.loc);

            if (location.geometry.viewport) {
              $rootScope.map.fitBounds(location.geometry.viewport);
            } else {
              $rootScope.map.setCenter(location.geometry.location);
              $rootScope.map.setZoom(15);
            }

            // Set the position of the marker using the place ID and location.
            $rootScope.markerDestination.setPlace(/** @type {!google.maps.Place} */ ({
              placeId: location.place_id,
              location: location.geometry.location
            }));
            $rootScope.markerDestination.setVisible(true);  
          });
        };
      });
    }
  }
});