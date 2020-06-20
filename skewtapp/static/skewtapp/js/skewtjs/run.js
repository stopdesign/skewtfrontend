
import {cskewT} from  "./skewt.js"
import balloonImage from '../../images/balloon.png'


const run_skewt = () => { 

  let currentWmoId;
  let SkewTApiPath;

  SkewTApiPath = "https://api.skewt.org"

  // Create the balloon icon on the windy leaflet map
  const myIcon = L.icon({
    iconUrl: balloonImage,
    iconSize: [30, 40],
    iconAnchor: [5, 40]
  });

  // Create the pulsating ring animation div
  const cssIcon = L.divIcon({
      className: 'css-icon', 
      html: '<div class="gps_ring"></div>',
      iconSize: [25,20]
  });

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      const onSuccess = (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let pos = [lat,lng];
          resolve(pos)
      };
      const onError = () => {
          console.log('I can\'t get your location info.');
          reject();
      };
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });
  };

  async function fetchSonde(wmo_id) {
    const response = await fetch(`${SkewTApiPath}/api/sondes/?wmo_id=${wmo_id}`);

    return response.json();
  }
 
  async function fetchSondeAllSondes() {
    const response = await fetch(`${SkewTApiPath}/api/available/`);
    return response.json();
  }
  
  async function nearestSonde(lat, lon) {
    const response = await fetch(`${SkewTApiPath}/api/nearest/?lat=${lat}&lon=${lon}`);
    if (response.ok) {
      return response.json();
    } else {
      const camborne = await fetch(`${SkewTApiPath}/api/sondes/?wmo_id=03808`);
      return camborne.json();
    }
  }

  const onMarkerClick = (wmo_id) => {
    d3.selectAll('path').interrupt();
    fetchSonde(wmo_id).then((sonde) => {
      currentWmoId = sonde.wmo_id;
      cskewT(sonde);
    });
  }

  window.addEventListener("resize", () => {
    onMarkerClick(currentWmoId );
  });

  const main = (position) => {
      // Part of the windy api, my personal key and the starting lat/lon, zoom, and overlay.
      const options = {
        key: 'psfAt10AZ7JJCoM3kz0U1ytDhTiLNJN3',
        lat:  position[0],
        lon: position[1],
        zoom: 5,
        overlay: "clouds",
        isolines: "pressure"
      };
  
      windyInit( options, windyAPI => {
  
        const { store, map } = windyAPI;
  
          // Make windy logo clickable
        const logo = document.getElementById("logo");       // Make the windy logo clickable. Required by the windy api T&Cs.
        logo.setAttribute('href','https://www.windy.com');
  
        let pb = document.getElementById("progress-bar")
        if (pb) { pb.classList.add("d-none") }
  
        nearestSonde(position[0], position[1]).then(nearest => {
          onMarkerClick(nearest.wmo_id)
          window.pulsing_marker = L.marker([nearest.lat, nearest.lon], {icon: cssIcon}).addTo(map);
        });
  
        
        fetchSondeAllSondes().then((allSondes) => {
          allSondes.forEach((sonde) => {
            let M = L.marker({'lat': sonde.lat, 'lon': sonde.lon}, {icon:myIcon, Id: sonde.wmo_id}).addTo(map);
            M.addEventListener('click', function() {
              let newLatLng = new L.LatLng(sonde.lat, sonde.lon);
              pulsing_marker.setLatLng(newLatLng);
              onMarkerClick(sonde.wmo_id);
            })
          })
        });
      });//windyInit
  }

  getPosition().then((position) => {    // geolocator wrapper
    main(position);
  }).catch(() => {
    main([50.2183, -5.3275]);
  });
}

export { run_skewt }
