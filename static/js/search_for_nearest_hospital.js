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

////////////only simulation///////////////
// var pointList = [new L.LatLng(50.880135, -113.956611),
//   new L.LatLng(50.881215, -113.956751),
//   new L.LatLng(50.882223, -113.95725),
//   new L.LatLng(50.882394, -113.957099),
//   new L.LatLng(50.882984, -113.954283),
//   new L.LatLng(50.8833, -113.952899)];
// var firstpolyline = new L.polyline(pointList,{
// color: 'red',
// weight: 3,
// opacity: 0.5,
// smoothFactor: 1
// });
// firstpolyline.addTo(map);
/////////////////////////////////////////

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

function deleteAllLayers(removeSelected=true){
  for(i in map._layers) {
    if(map._layers[i]._path != undefined) {
        try {
            // console.log("i",i);
            // console.log("layer:",map._layers[i]);
            if(!removeSelected && (map._layers[i]==selectedCircle)){
              continue;
            }
            map.removeLayer(map._layers[i]);
        }
        catch(e) {
            console.log("problem with " + e + map._layers[i]);
        }
    }
}
}

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
  if(map.hasLayer(userMarekerLayer)){
    map.removeLayer(userMarekerLayer);
  }
  userMarekerLayer=layer;
  console.log("userMarekerLayer:");
  console.log(userMarekerLayer);
  ///remove selected circle if the best path is created 
  if(map.hasLayer(BestPath)){
    deleteAllLayers(removeSelected=true);
  }
  else{
    deleteAllLayers(removeSelected=false);
  }
  
});
map.on('draw:deleted', function (e) {
  drawControlEdit.remove();
  drawControl.addTo(map);

  if(map.hasLayer(nearestHospitalLayer)){
    // console.log("nearest hospital=",nearestHospitalLayer);
    map.removeLayer(nearestHospitalLayer);
    // console.log("nearest hospital=",nearestHospitalLayer);
  } 

  deleteAllLayers();

});
var favoriteCircle;
var selectedCircle;
var nearestHospitalLayer;
var hospitals_dict={};
// var all_paths_polyline={"shortest":null, "normal":[]};
var BestPath;
var loader = document.querySelector(".loader");
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
  location.href=Flask.url_for('hospital_clinic_details', {code:hospital_clinic_code})
}

function getNumberOfTrafficSignals(PathPolyline){
  let i;
  let count=0; 
  console.log("PathPolyline=",PathPolyline);
  // let k;
  // for(k=0.01; k<1;k+=0.001){
  //   interPolatedPoint=L.GeometryUtil.interpolateOnLine(map, PathPolyline, k);
  //   PathPolyline.addLatLng([interPolatedPoint.latLng.lat,interPolatedPoint.latLng.lng]);
  //   // console.log(interPolatedPoint);
  // }
  
  for (i=0; i<traffics.features.length;i++){
    let feature=traffics.features[i];
    // console.log("feature coordinates:",feature.geometry.coordinates[1]);
    let trafficPoint = new L.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    // console.log("before closest poly");
    nearestPointOnPoly = L.GeometryUtil.closest(map,PathPolyline,[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
    // console.log("nearestPointOnPoly:",nearestPointOnPoly);
    // let length = L.GeometryUtil.length([nearestPointOnPoly, trafficPoint]);
    let length =trafficPoint.distanceTo(nearestPointOnPoly);
    // let length = L.GeometryUtil.distance(map, nearestPointOnPoly, trafficPoint);
    // console.log("length=",length);
    if(length<107){
      console.log("nearest length=",length);
      count+=1;
    }
    
  }
  console.log("number of traffics at this path equal=",count);
  return count;
}
function getDistanceOfPolyline(polylinePath){
    // Calculating the distance of the polyline
    var tempLatLng = null;
    var totalDistance = 0.00000;
    $.each(polylinePath._latlngs, function(i, latlng){
        if(tempLatLng == null){
            tempLatLng = latlng;
            return;
        }

        totalDistance += tempLatLng.distanceTo(latlng);
        tempLatLng = latlng;
    });

  return totalDistance;
}
async function  getPathsBetweenTwoLocations(locationGeoFeature1,locationGeoFeature2,checkTaffic=false) {
  const data = getPathToBetweenLocations(locationGeoFeature1,locationGeoFeature2,function(response) {
    console.log("this is locationGeoFeature1:");
    console.log(locationGeoFeature1);

    console.log("this is locationGeoFeature2");
    console.log(locationGeoFeature1);

    console.log("Response is:");
    console.log(response);
      // var polyUtil = require('polyline-encoded');
        let list_of_latlangs=[];
        let minTrafficCount=1570;
        for (let j = 0;j < response.routes.length;j++) {
            for (let i = 0;i < response.routes[j].legs[0].steps.length;i++) {
                var polyline = L.Polyline.fromEncoded(response.routes[j].legs[0].steps[i].geometry)
                console.log("polyline lat lang",L.PolylineUtil.decode(response.routes[j].legs[0].steps[i].geometry));
                list_of_latlangs.push(...L.PolylineUtil.decode(response.routes[j].legs[0].steps[i].geometry));
                
            }
            if(!checkTaffic){ //if you would like to get the shortest path without checking checking the traffic signals, return the shortest one
              if(j==0){

                BestPath=L.polyline(list_of_latlangs,{color:'red'});
                // console.log("best path:",BestPath);
                list_of_latlangs=[]; //remove list by using new empty array

              }
              else{
                let polyPath=L.polyline(list_of_latlangs,{color:'grey'}).addTo(map);
                list_of_latlangs=[]; //remove list by using new empty array
                let distanceofPoly=getDistanceOfPolyline(polyPath);
                // polyPath.bindPopup("total distance (in meters)= "+(distanceofPoly).toFixed(2));
                polyPath.bindPopup("Alternative route path");
              }
            }
            else{  //get the path that has less traffic signal
              console.log("check traffic in the upper loop");
              let polylinePath=L.polyline(list_of_latlangs,{color:'grey'}).addTo(map);
              list_of_latlangs=[];//remove list by using new empty array
              let TrafficSignalsCount=getNumberOfTrafficSignals(polylinePath);
              console.log("TrafficSignalsCount=",TrafficSignalsCount);
              if(TrafficSignalsCount<minTrafficCount){
                minTrafficCount=TrafficSignalsCount;
                BestPath=polylinePath;
              }
              // polylinePath.bindPopup("Number of Traffic Signals="+TrafficSignalsCount.toString(10));
              polylinePath.bindPopup("Alternative route path");

            }

        }
        if(checkTaffic){
          BestPath.setStyle({color:"green"});
          BestPath.bindPopup("least traffic control signals path")
          // BestPath.addTo(map);
        }
        else{ //shortest path
          BestPath.addTo(map);
          let distanceofPoly=getDistanceOfPolyline(BestPath);
          // BestPath.bindPopup("total distance (in meters)= "+(distanceofPoly).toFixed(2));
          BestPath.bindPopup("Shortest path")
        }
  });
  // return await data;
}
async function pathToNearest (checkTaffic) {
    if(!map.hasLayer(userMarekerLayer)){
        alert("User location is not selected.\nPlease, specify a user location.");
        return false;
    }
    loader.style.display= "block";
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

  //get all pathes between two locations, including the shortest one
   getPathsBetweenTwoLocations(userMarekerGeojsonFeature,nearestHospital,checkTaffic);
   loader.style.display= "none";
  // console.log("returnedData:",returnedData);


}

const getPathToBetweenLocations = (loc_1, loc_2, callback) => {
const url =  "/direction/" + loc_1.geometry.coordinates[0] + ',' + loc_1.geometry.coordinates[1] + '/' +  loc_2.geometry.coordinates[0] + ',' + loc_2.geometry.coordinates[1];
    $.ajax({
      url: "/direction/" + loc_1.geometry.coordinates[0] + ',' + loc_1.geometry.coordinates[1] + '/' +  loc_2.geometry.coordinates[0] + ',' + loc_2.geometry.coordinates[1] ,
      method: 'GET'
    }).done(function(data) {
      console.log('request recieved');
      console.log(data);
      callback(data)
      return data
    });

}


async function pathToSelected(checkTaffic){
  console.log("get path to selected hospital");
  if(!map.hasLayer(selectedCircle)){
    alert("No Hospital/Clinic is selected");
    return false;
  }

  if(!map.hasLayer(userMarekerLayer)){
    alert("User location is not selected.\nPlease, specify a user location.");
    return false;
  }
    loader.style.display= "block";
    let loc_1=userMarekerLayer.getLatLng();
    console.log("loc_1:");
    console.log(loc_1);
    var userMarekerGeojsonFeature = {
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": [loc_1.lng,loc_1.lat]
      }
  };


    let loc_2=selectedCircle.getLatLng();
    console.log("loc_1:");
    console.log(loc_1);
    var selectedCircleGeojson = {
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": [loc_2.lng,loc_2.lat]
      }
    };
  //get all pathes between two location, including the shortest one. 
  getPathsBetweenTwoLocations(userMarekerGeojsonFeature, selectedCircleGeojson,checkTaffic);
  loader.style.display= "none";

 

}
// function removeSelected(){
//   if(map.hasLayer(selectedCircle)){
//     map.removeLayer(selectedCircle);
//   }
// }
////////////////////////////////////////
document.addEventListener("DOMContentLoaded",()=>{
///////////////toggle layers/////////////////
document.querySelector("#toggleLayer").onclick= function(){
  if(this.value=="Satellite"){
    map.removeLayer(grayLayer);
    map.addLayer(mylayer);
    this.value="Gray";
    // document.querySelector("#toggleLayer").style.backgroundImage = "url('/static/images/grayLayer.JPG')";
    document.querySelector("#toggleLayer").style.backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,1)), url('/static/images/grayLayer.JPG')";
    currentLayer=mylayer;
    
  }
  else if(this.value=="Gray"){
    map.removeLayer(mylayer);
    map.addLayer(grayLayer);
    this.value="Satellite";
    // document.querySelector("#toggleLayer").style.backgroundImage = "url('/static/images/mylayer.JPG')";
    document.querySelector("#toggleLayer").style.backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0) 10%, rgba(0,0,0,1)), url('/static/images/mylayer.JPG')";
    currentLayer=grayLayer;
  }
};
});
////////////////////////////////////////////
document.addEventListener("DOMContentLoaded",()=>{
  // var loader = document.querySelector(".loader");
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
       if((selectedCircle!= undefined) && (circleLoc==selectedCircle.getLatLng())){
         selectedCircle=undefined;
         return;
       }
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

