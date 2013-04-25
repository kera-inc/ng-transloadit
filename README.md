# ng-transloadit

A service for uploading to transloadit.com

## Purpose & Rationale

* Upload files with progress indicator

## Caveats

* Only works with secure uploads (https://transloadit.com/docs/authentication)
* Only works with single files
* Waits until the assembly is done processing before firing upload callback

## Installation

* require angular (tested on 1.1.2)

## Usage

```javascript
angular.module('myApp', ['ngTransloadit']).controller('MyCtrl', ['$scope', 'Transloadit', (function($scope, Transloadit) {
  $scope.upload = function(file) {
    Transloadit.upload(file, {
      params: {
        auth: {
          key: 'my-auth-key'
        },

        template_id: 'my-template-id'
      },

      signature: function(callback) {
        // ideally you would be generating this on the fly somewhere
        callback('here-is-my-signature');
      },

      progress: function(loaded, total) {
        console.log(loaded + 'bytes loaded');
        console.log(total + ' bytes total');
      },

      processing: function() {
        console.log('done uploading, started processing');
      },

      uploaded: function(assemblyJson) {
        console.log(assemblyJson);
      },

      error: function(error) {
        console.log(error);
      }
    });
  }
}]);

```


## Copyright

Copyright (c) 2012 Cameron Westland. See LICENSE.txt for further details.

