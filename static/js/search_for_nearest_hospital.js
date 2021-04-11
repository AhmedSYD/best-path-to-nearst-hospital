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

// L.mapbox.accessToken="pk.eyJ1IjoiYWhtZWRzeWQiLCJhIjoiY2tsaWttNXd3MGR6djJwbm0yNjh3dTVtdiJ9.LxSvLSwUs6MZdZxym8V9wA";
var mylayer=L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
maxZoom: 22,
id: 'ahmedsyd/cknc85hz519ln17o6t2pet38r',

tileSize: 512,
zoomOffset: -1,
accessToken: 'pk.eyJ1IjoiYWhtZWRzeWQiLCJhIjoiY2tsaWttNXd3MGR6djJwbm0yNjh3dTVtdiJ9.LxSvLSwUs6MZdZxym8V9wA'
})
var currentLayer=grayLayer;

var map = L.map('map',{zoomControl: true, drawControl: true}).setView([51.049999, -114.066666], 13);
map.addLayer(currentLayer);

map.zoomControl.setPosition('bottomright');

var markers = L.markerClusterGroup();

// var polyline=[]
var userMarekerLayer;
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
var traffics;
var hospitals_clinics;

map.on('draw:created', function(e) {
  var type = e.layerType,
    layer = e.layer;
    drawControl.remove();
    drawControlEdit.addTo(map);
  if (type === 'marker') {
    layer.bindPopup('user location');
  }
   
  editableLayers.addLayer(layer);
  simplified_created=0;
  userMarekerLayer=layer;
  console.log("userMarekerLayer:");
  console.log(userMarekerLayer);
});
map.on('draw:deleted', function (e) {
  drawControlEdit.remove();
  drawControl.addTo(map);

  if(map.hasLayer(nearestHospitalLayer)){
    map.removeLayer(nearestHospitalLayer);
  } 
 
  // }
});
var favoriteCircle;
var selectedCircle;
var nearestHospitalLayer;
var hospitals_dict={};
//////functions/////////////////////////
/* Set the width of the sidebar to 250px (show it) */
function openNav() {
  document.getElementById("mySidepanel").style.width = "250px";
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
  document.getElementById("mySidepanel").style.width = "0";
  if(map.hasLayer(favoriteCircle)){
    map.removeLayer(favoriteCircle);
  }
}

function open_review(hospital_clinic_code){
  console.log("clicked");
  console.log(hospital_clinic_code);
  map.closePopup();
  // var state = map.save();
  // console.log(state);
  location.href=Flask.url_for('hospital_clinic_details', {code:hospital_clinic_code})
}

function pathToNearest(){
    console.log("get path to nearest hospital");
    let loc=userMarekerLayer.getLatLng();
    console.log("loc:");
    console.log(loc);
    var userMarekerGeojsonFeature = {
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": [loc.lng,loc.lat]
      }
  };
    if(map.hasLayer(nearestHospitalLayer)){
      map.removeLayer(nearestHospitalLayer);
    }
    var nearestHospital = turf.nearest(userMarekerGeojsonFeature, hospitals_clinics);
    console.log("nearestHospital:");
    console.log(nearestHospital);

    var geojsonMarkerOptions = {
      radius: 25,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };
  
 nearestHospitalLayer=L.geoJSON(nearestHospital, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
      }
  }).addTo(map);
}

function pathToSelected(){
  console.log("get path to selected hospital");
  if(!map.hasLayer(selectedCircle)){
    alert("No circle is selected");
    return false;
  }
}
function removeSelected(){
  if(map.hasLayer(selectedCircle)){
    map.removeLayer(selectedCircle);
  }
}
////////////////////////////////////////
document.addEventListener("DOMContentLoaded",()=>{
///////////////toggle layers/////////////////
document.querySelector("#toggleLayer").onclick= function(){
  if(this.value=="Satellite"){
    map.removeLayer(grayLayer);
    map.addLayer(mylayer);
    this.value="Gray";
    document.querySelector("#toggleLayer").style.backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,1)), url('/static/images/grayLayer.JPG')";
    // document.querySelector("#toggleLayer").style.color= "rgb(0, 132, 255)";
    currentLayer=mylayer;
    
  }
  else if(this.value=="Gray"){
    map.removeLayer(mylayer);
    map.addLayer(grayLayer);
    this.value="Satellite";
    document.querySelector("#toggleLayer").style.backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,1)), url('/static/images/mylayer.JPG')";
    // document.querySelector("#toggleLayer").style.color= "white";
    currentLayer=grayLayer;
  }
};
});
////////////////////////////////////////////
document.addEventListener("DOMContentLoaded",()=>{
  var loader = document.querySelector(".loader");
  console.log("loader");
  console.log(loader);
  loader.style.display= "block";
  console.log(loader);
  //connect to websocket
  var socket = io.connect(location.protocol+"//"+document.domain+":"+location.port)
  socket.on('connect',()=>{
    socket.emit("read_data");
  });
  socket.on("map_data",data=>{
    // data_json=JSON.parse(data.responseText);
    traffics=data.traffics;
    hospitals_clinics=data.hospitals_clinics;
    console.log(traffics);
    console.log(hospitals_clinics);
    
    // var oms = new OverlappingMarkerSpiderfier(map);
    // var popup = new L.Popup();
    // oms.addListener(marker, 'mouseover', function() {oms.event.trigger(this, 'click')});
    // oms.addListener('mouseover', function(marker) {
    // popup.setContent(marker.desc);
    // popup.setLatLng(marker.getLatLng());
    // map.openPopup(popup);
    // });
    // oms.addListener('spiderfy', function(markers) {
    //     map.closePopup();
    // });
    // function onMapClick(marker) {
    //   popup
    //       .setLatLng(marker.getLatLng())
    //       .setContent(marker.desc)
    //       .openOn(map);
    // }
    // map.on('click', onMapClick);
    
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
    var popcontent= datum.properties.name+"<br>"+
                    '<a href="javascript:void(0)" onclick="open_review(\'' + datum.properties.comm_code + '\')">View/Add Review</a>'
    hospitals_dict[datum.properties.comm_code]=loc;
    // marker.desc = popcontent;//popcontent
    marker.bindPopup(popcontent).openPopup();
    marker.on('mouseover', function (e) {
      this.openPopup();
    });
    marker.on('dblclick',function (e){
      if(map.hasLayer(selectedCircle)){
        map.removeLayer(selectedCircle);
      }
       let circleLoc=this.getLatLng();
       selectedCircle= L.circleMarker(circleLoc, {radius: 25}).setStyle({color: "green"}).addTo(map);
    });
    // marker.on('mouseout', function (e) {
    //   this.closePopup();
    // });
    // mymap.addLayer(marker);
    // oms.addMarker(marker);

    markers.addLayer(marker);
    
  }


  map.addLayer(markers);
  loader.style.display= "none";

});

document.querySelectorAll(".favoriteLink").forEach(link=>{
    link.onclick=function(){
      if(map.hasLayer(favoriteCircle)){
        map.removeLayer(favoriteCircle);
      }
      let codeValue=this.getAttribute('value');
      let circleLoc = hospitals_dict[codeValue];
      setTimeout(function(){
        map.setView(circleLoc,13);
      }, 100);
      // map.setView(circleLoc);
      favoriteCircle = L.circleMarker(circleLoc, {radius: 25}).addTo(map);
      console.log("click value:");
      console.log(codeValue);
    };
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

