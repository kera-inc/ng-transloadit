angular.module('ng-transloadit', []).factory('Transloadit', ['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout) {
  $scope = $rootScope.$new();

  var TRANSLOADIT_API = 'http://api2.transloadit.com/assemblies';

  function getExpiryDate() {
    var date = new Date();
    date.setHours(date.getHours() + 12);

    var year = date.getUTCFullYear();
    var month = zeroFill(date.getUTCMonth() + 1, 2);
    var day = zeroFill(date.getUTCDate(), 2);

    var hours = zeroFill(date.getUTCHours(), 2);
    var minutes = zeroFill(date.getUTCMinutes(), 2);
    var seconds = zeroFill(date.getUTCSeconds(), 2);

    return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds + '+00:00';
  }

  function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
      return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }

    return number + ""; // always return a string
  }

  return {
    upload: function(file, options) {
      var cancelled = false;
      var xhr = new XMLHttpRequest();

      this._validateBrowser();
      this._validateOptions(options);
      this._addExpiryDate(options);

      function check(assemblyUrl) {
        if (cancelled) {
          return false;
        }

        $timeout(function() {
          $scope.$apply(function() {
            $http.get(assemblyUrl).success(function(results) {
              if (results.ok === 'ASSEMBLY_COMPLETED') {
                options.uploaded(results);
              } else {
                check(results.assembly_url);
              }
            }).error(options.error);
          });
        });
      }

      options.signature(function(signatureValue) {
        var paramsValue = angular.toJson(options.params);

        var formData = new FormData();
        formData.append('params', paramsValue);
        formData.append('signature', signatureValue);
        formData.append(file.name, file);

        xhr.open('POST', TRANSLOADIT_API, true);
        xhr.onload = function(response) {
          var results = angular.fromJson(this.response);
          options.processing();

          check(results.assembly_url);
        };

        xhr.upload.onprogress = function(e) {
          if (e.lengthComputable) {
            options.progress(e.loaded, e.total);
          }
        };

        xhr.send(formData);
      });

      return {
        cancel: function() {
          cancelled = true;
          xhr.abort();
        }
      };
    },

    _validateBrowser: function() {
      var isXHR2 = typeof new XMLHttpRequest().upload !== 'undefined';

      if (!isXHR2) {
        throw new Error('Transloadit will only work with XMLHttpRequest 2');
      }
    },

    _validateOptions: function(options) {
      // mandatory fields
      if (!options.signature) {
        throw new Error('must supply a signature function');
      }

      if (!options.uploaded) {
        throw new Error('must supply an uploaded callback');
      }

      if (!options.params) {
        throw new Error('must supply params');
      }

      if (!options.params.auth.key) {
        throw new Error('must supply a key');
      }

      // optional fields
      options.processing = options.processing || function() {};
      options.progress = options.progress || function() {};
      options.error = options.error || function() {};
    },

    _addExpiryDate: function(options) {
      options.params.auth.expires = getExpiryDate();
    }
  };
}]);
