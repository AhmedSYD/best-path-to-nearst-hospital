//defime global variables
var grayLayer=L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/light-v9',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiYWhtZWRzeWQiLCJhIjoiY2tsaWtvemlqMGE0czJ4cGxlaHMwZGUzNyJ9.ZqoUVoiuHS9LzOvahBnWKw'
});

var map = L.map('map',{zoomControl: true, drawControl: true}).setView([51.049999, -114.066666], 13);
map.addLayer(grayLayer);

map.zoomControl.setPosition('bottomright');

var markers = L.markerClusterGroup();

var polyline=[]
var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

var drawPluginOptions = {
  position: 'topright',
  draw: {
    // disable toolbar item by setting it to false
    polygon: false,
    circle: false, // Turns off this drawing tool
    rectangle: false,
    polyline: false,
    marker: {
      allowIntersection: false, // Restricts shapes to simple polygons
      drawError: {
        color: '#e1e100', // Color the shape will turn when intersects
        message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
      },
      shapeOptions: {
        color: '#97009c'
      }
    },

    },
  edit: {
    featureGroup: editableLayers, //REQUIRED!!
    remove: false
  }
};

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw(drawPluginOptions);
map.addControl(drawControl);

drawControlEdit = new L.Control.Draw({
  edit: {
    featureGroup: editableLayers,
    edit: false
  },
  draw: false
});
var layerGroup =  new L.FeatureGroup();
var simplified;
var simplified_created=0; //flag to check if the samplified polygon is created or not
map.on('draw:created', function(e) {
  var type = e.layerType,
    layer = e.layer;
    drawControl.remove();
    drawControlEdit.addTo(map);
  if (type === 'marker') {
    layer.bindPopup('A popup!');
  }
   
  editableLayers.addLayer(layer);
  simplified_created=0;
  polyline=layer.getLatLngs()
});
map.on('draw:deleted', function (e) {
  drawControlEdit.remove();
  drawControl.addTo(map);
  
 
  // }
});

document.addEventListener("DOMContentLoaded",()=>{
  //connect to websocket
  var socket = io.connect(location.protocol+"//"+document.domain+":"+location.port)
  socket.on('connect',()=>{
    socket.emit("read_data");
  });
  socket.on("map_data",data=>{
    // data_json=JSON.parse(data.responseText);
    var traffics=data.traffics;
    var hospitals_clinics=data.hospitals_clinics;
    console.log(traffics);
    console.log(hospitals_clinics);

    var oms = new OverlappingMarkerSpiderfier(map);
    var popup = new L.Popup();
    oms.addListener('click', function(marker) {
    popup.setContent(marker.desc);
    popup.setLatLng(marker.getLatLng());
    map.openPopup(popup);
    });
    oms.addListener('spiderfy', function(markers) {
        map.closePopup();
    });
    
    markers.clearLayers();
    map.closePopup();
    // const json_date=JSON.parse(request.responseText);
    
    // console.log(json_date)
  //   if ( !("features" in json_date) || (json_date.features.length==0)){
  //     // loader.style.display= "none";
  //     alert("No building permits for this date range.");
  //     map.setZoom(13);
  //     return false;
  // }

  var hospIcon = L.icon({
    iconUrl: '/static/images/hospital_icon.png',

    iconSize:     [38, 38] // size of the icon
});
  for (i=0; i<hospitals_clinics.features.length;i++){
    // console.log("json data geometry:"+json_date.features[i].geometry.coordinates);
    // console.log("json data properties issueddate:"+json_date.features[i].properties.issueddate);
    var datum=hospitals_clinics.features[i];
    var loc = new L.LatLng(datum.geometry.coordinates[1], datum.geometry.coordinates[0]);
    var marker = new L.Marker(loc,{icon: hospIcon});
    // var popcontent="issueddate: "+datum.properties.issueddate+"<br>"+
    //                 "workclassgroup: "+datum.properties.workclassgroup+"<br>"+
    //                 "contractorname: "+datum.properties.contractorname+"<br>"+
    //                 "communityname: "+datum.properties.communityname+"<br>"+
    //                "originaladdress: "+datum.properties.originaladdress;
    var popcontent= datum.properties.name
    marker.desc = popcontent;//popcontent
    // mymap.addLayer(marker);
    oms.addMarker(marker);

    markers.addLayer(marker);
    
  }
  map.addLayer(markers);
});
});

// document.getElementById("simplify").addEventListener("click", function() {
//   if(polyline.length==0){
//     alert("No polyline is drawn!!");
//     return;
//   }
//   if(simplified_created){// simplified is already created and no more polygon is drawn
//     alert("Simplified polyline is already created and no more polyline is drawn!");
//     return;   
//   }
//   console.log("outputlayers:");
//   console.log(polyline);
  

//   console.log(polyline.length);
//   // var first_loc;

//   var results = polyline.map((item, index) => {
//       // if(index==0){
//       //   first_loc=[item.lng, item.lat];
//       // }
//       return [item.lng, item.lat];
      
//   });
//   // console.log("final array in the result:");
//   // console.log(results[results.length-1]);

//   // if(results[results.length-1]!=first_loc){
//   //   results.push(first_loc);
//   // }
  

  
//   // results=[results];
//   console.log("results");
//   console.log(results);
//   var geojson = turf.lineString(results);
//   console.log("geojson data:");
//   console.log(geojson);
//   var options = {tolerance: 0.01, highQuality: false};

//   simplified = turf.simplify(geojson, options);
//   // var line = turf.polygonToLine(simplified);
//   console.log("simplified:")
//   console.log(simplified)
//   // console.log("line:")
//   // console.log(line)
  
//   L.geoJSON(simplified).addTo(map);
//   simplified_created=1;
  
// });

