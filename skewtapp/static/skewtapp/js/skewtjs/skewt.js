import { drawIsolines } from "./draw_isolines";
import { plotSounding } from "./plot_sounding";
import { parcels } from "./parcels";
import { cbarbs } from "./windbarbs";
import { clouds } from "./cloud_diagram";

const cskewT = (Ascent) => {
  /* This is a refactored version of the skewT
  design for tephigrams.org (planning to
  migrate this to skewt.org).

  John C. Kealy 2020 */
  d3.select("#skw").remove()
  d3.select("#windsvg").remove()
  d3.select("#can").remove()

  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const mobile = (vw < 992);
  let isoPlethFont;
  let strokeFactor;
  const Cp = 1.03e3;
  const Rd = 287.0;
  const Dp = -1.5;
  const w = document.getElementById("Tephi").offsetWidth;
  const h = document.getElementById("Tephi").offsetHeight;

  if(mobile){ isoPlethFont = "10px"; strokeFactor = 0.7; } else { isoPlethFont = "17px"; strokeFactor = 1; };
  if(mobile){ document.getElementById("frames-container").style.height = "35px"; };

  const svg = d3.select("#Tephi")
    .append("svg")
    .attr('id', 'skw')
    .attr('width', w)
    .attr("height", h);

  const setPressureLevels= (startpressure, endpressure) => {
    const ratio = (150/1050)*(startpressure/endpressure)
    const T0 = Ascent.temperatureK[0] - 273.15
    let pressure = startpressure;
    let P = [startpressure];
    while (pressure > endpressure) {
        pressure = pressure+Dp;
        P.push(pressure);
    }
    return {'P': P, 'minT': T0-ratio*55, 'maxT': T0+ratio*25, 'minP': P[P.length-1], 'maxP': P[0]}
  }

  let limits = setPressureLevels(1050, 150)
  let P = limits.P
  const minT = limits.minT
  const maxT = limits.maxT
  const minP = limits.minP
  const maxP = limits.maxP

  const S = {
    "w": w,
    "h": h,
    "P": P,
    "svg": svg,
    "Cp": Cp,
    "Dp": Dp,
    "Rd": Rd,
    "minT": minT,
    "maxT": maxT,
    "minP": minP,
    "maxP": maxP,
    "isoPlethFont": isoPlethFont,
    "strokeFactor": strokeFactor
  }

  drawIsolines(S);
  Ascent = plotSounding(Ascent, S);
  cbarbs(Ascent, S);
  parcels(Ascent, S);
  clouds(Ascent, S);
};

export { cskewT };
