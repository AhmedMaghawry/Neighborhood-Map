var locations = [
    {title: 'Carl Schurz Park', location: {lat: 40.774944, lng: -73.943820}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}},
    {title: 'West 87th Street Dog Run', location: {lat: 40.790505,lng: -73.980533}}
];
var first = false;
var not_found_error = "Not Found";

/*Map Initialization and Functions*/

var map;
var markers = [];
var largeInfowindow;
var timeout = 1400;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13
    });

    largeInfowindow = new google.maps.InfoWindow();

    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        markers.push(marker);

        marker.addListener('click', marker_actions);
    }

    function marker_actions () {
        populateInfoWindow(this, largeInfowindow);
        if (this.getAnimation() !== null) {
            this.setAnimation(null);
        } else {
            var self = this;
            this.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                self.setAnimation(null);
            }, timeout);
        }
    }

    /*function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<h1>' + marker.title + '</h1>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker = null;
            });
        }
    }*/
}

/*================================================*/

var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

var ViewModel = function () {

    self = this;
    self.locs = ko.observableArray([]);
    self.filter = ko.observable("");
    for (var i = 0; i < locations.length; i++) {
        self.locs.push(locations[i].title);
    }

    self.filtered = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            if(first)
              adapt_map_with_list(self.locs());
            return self.locs();
        } else {
            var temp = ko.utils.arrayFilter(self.locs(), function(item) {
                return stringStartsWith(item.toLowerCase(), filter);
            });
            first = true;
            adapt_map_with_list(temp);
            return temp;
        }
    });

  self.menu = function() {
        $(this).toggleClass('active');
        $('aside').animate({width: 'toggle'}, 200);
  };

  self.listAction = function () {
      var str = this;
      var id = (self.locs()).indexOf(str+"");
      marker_action_listView(markers[id]);
  };
};

ko.applyBindings(new ViewModel());
/*============================================*/

// This function will loop through the markers array and display them all.
function adapt_map_with_list(array_filter) {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      var num = array_filter.indexOf(markers[i].title);
      if(num != -1) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
      } else {
          markers[i].setMap(null);
      }
    }
    map.fitBounds(bounds);
}

function marker_action_listView (marker) {
    largeInfowindow = new google.maps.InfoWindow();
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        populateInfoWindow(marker, largeInfowindow);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, timeout);
    }
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {

      var latt = marker.position.lat();
      var lang = marker.position.lng();
      var url = 'https://api.foursquare.com/v2/venues/search?ll=' + latt + ',' + lang + '&client_id=' + client + '&client_secret=' + sec +  '&query=' + marker.title + '&v=20180206&m=foursquare';
      var cont;
        $.getJSON(url).done(function(marker) {
            var response = marker.response.venues[0];
            var stre = response && response.location && response.location.formattedAddress[0] || not_found_error;
            var ci = response && response.location && response.location.formattedAddress[1] || not_found_error;
            var name = response && response.name || not_found_error;
            cont =
                '<h1>(' + name + ')</h1>' +
                '<h3> Address: </h3>' +
                '<p>' + stre + '</p>' +
                '<h3> City: </h3>' +
                '<p>' + ci + '</p>';
            infowindow.marker = marker;
            infowindow.setContent(cont);
        }).fail(function() {
            // Send alert
            alert(
                "There is an error dealing with api, try again later"
            );
        });
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
            marker.setAnimation(null);
        });
      /*  infowindow.marker = marker;
        infowindow.setContent('<h1>' + marker.title + '</h1>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
        });*/
    }
}

var err = function err() {
    alert(
        'There is an error while Loading, Try again'
    );
};

/*Info api from Foursquare */
var client = "R00ABNGHFWLZPZXS3Y1WTIMEWC0YRWPRODGQBMTONSBYJI4J";
var sec = "4Z5SHLHLFA023RY4GR1EBRL4V4T5Z5GE13SVJYLLUF4RQ3A1";
