Parse.initialize("wFFZue6UImviqCkCtBlLazQ51N39l3TUy04u2i8l", "hyPckU5KOyjTh2AZPdKs1zUYSYlAkbcHC3XC0gOz");
//map settings/initializers changed here
var map; // global map variable
var openPin = null; // global open pin var
var markers = new Array(); // global marker array


// this function will be called on startup, this is where map options are modified
function initialize() {
  var mapOptions = {zoom: 2, center: new google.maps.LatLng(0,0), minZoom:2};
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}


// marker class for the map
function Marker (latitude, longitude, name, message, url) {
        this.name = name;
        this.message = message;
        this.coords = new google.maps.LatLng(latitude, longitude);
        this.marker = new google.maps.Marker({position: this.coords, map: map, title: this.name+"'s diary."}); //creates an instance of marker
        this.url = url;

        this.makeInfoWindow = function makeInfoWindow() { // function for creating info window

        // This is marker info window content, HTML encoded.
          var infoContent = '</div>'+
                  '<h1 id="firstHeading" class="firstHeading">'+this.name+'</h1>'+
                  '<div id="bodyContent">'+'<p>'+this.message+'</p>'+'<img src='+this.url+' style="max-height:400px; max-width: 400px;"/>'+'</div>'+
                  '</div>';
          var infowindow = new google.maps.InfoWindow({content: infoContent}); // instance of info window
          return infowindow;
        };

        this.window = this.makeInfoWindow();
        var self = this; //WOAH SOMEONE EXPLAIN WHY THIS WORKS... BUT ANY OTHER WAY DOESN'T! WTF!!!
        google.maps.event.addListener(this.marker, 'click', function(){
          self.window.open(map, self.marker);
          map.panTo(self.coords);
          if (openPin != null && openPin != self){
            openPin.window.close();
          }
          openPin = self;
        });
}


//function for making markers
function makeMarker() {
  marker = new google.maps.Marker({position: this.coords, map: map, title: this.name+"'s diary.'"});
  return marker;
}


//function for pushing a pin to the db
function pinToDatabase(latitude, longitude, name, message, url) {
  var Push = Parse.Object.extend("Pins"); //creating an instance of a Parse.Object of class "pins"
  var push = new Push(); //instance of Push class
  push.set("latitude", latitude);
  push.set("longitude", longitude);
  push.set("name", name);
  push.set("message", message);
  push.set("url", url);
  push.save(null, {
    success: function() {
      console.log("Database push succesful.");
    },
    error: function(push, error) {
      console.log(error.message);
    }
  })
  markers.push(new Marker(latitude, longitude, name, message, url));
}


function populateMap() {
  var Pins = Parse.Object.extend("Pins");
  var query = new Parse.Query(Pins);
  query.find({
    success: function(results) {
      console.log("Successfully retrieved " + results.length + " pins.");
      for (var i = 0; i < results.length; i++) {
        var pin = results[i];
        markers.push(new Marker(pin.get("latitude"), pin.get("longitude"), pin.get("name"), pin.get("message"), pin.get("url")));
      }
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
  console.log("Succesfully populated map.")
}


function getMenuItems() {
        if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        } else{
                alert('It seems like Geolocation, which is required for this page, is not enabled in your browser.');
        }
        function successFunction(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                var clientId = "30c38c5ab23bdb5";

                if (document.getElementById('InputFile').value) {
                var reader = new FileReader();
                imgFile = reader.readAsDataURL(document.getElementById('InputFile').files[0]);
                reader.onload = function(event) {
                                $.ajax({
                                        url: "https://api.imgur.com/3/upload",
                                        type: "POST",
                                        datatype: "json",
                                data: {
                                        image: event.target.result.replace('data:image/jpeg;base64,', ''),
                                        type: 'base64'
                                },
                                success: showMe,
                                error: showMe,
                                beforeSend: function (xhr) {
                                        xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
                                }
                                });

                                function showMe(data) {
                                        if (data.success === true) {
                                                var url = data.data.link;
                                                var name = document.getElementById("InputName").value;
                                                var message = document.getElementById("InputPost").value;
                                                pinToDatabase(lat, long, name, message, url);
                                        } else {
                                                alert("Upload image failed: Please use jpg or jpeg format.");
                                        }
                                }
                        };

                } else {
                        console.log("test");
                        var name = document.getElementById("InputName").value;
                        var message = document.getElementById("InputPost").value;
                        pinToDatabase(lat, long, name, message, "");
                }
        }

        function errorFunction(position)
        {
                alert('Error!');
        }

}



google.maps.event.addDomListener(window, 'load', function() {
  //on-load function calls
  initialize();
  populateMap();
});
