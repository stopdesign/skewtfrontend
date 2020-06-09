import { wetAdiabatGradient } from "./draw_isolines";


const parcels = (Ascent, S) => {

  const lambert = (xx, nb) => {
    const init = 1;
    const em = - Math.exp( -1.0 );
    const em9 = - Math.exp( -9.0 );
    const c13 = 1.0 / 3.0;
    const em2 = 2.0 / em;
    const s2 = Math.sqrt( 2.0 );
    const s21 = 2.0 * s2 - 3.0;
    const s22 = 4.0 - 3.0 * s2;
    const s23 = s2 - 2.0;
    let crude;

    if ( xx <= em9 ) {
      const zl = Math.log( -xx );
      const t = -1.0 - zl;
      const ts = Math.sqrt( t );
      crude = zl - ( 2.0 * ts ) / ( s2 + ( c13 - t / ( 2.7 + ts * 127.0471381349219 ) ) * ts );
    }
    else {
      const zl = Math.log( -xx );
      const eta = 2.0 - em2 * xx;
      crude = Math.log( xx / Math.log( - xx / ( ( 1.0 - 0.5043921323068457 * ( zl + 1.0 ) ) * ( Math.sqrt( eta ) + eta / 3.0 ) + 1.0 ) ) );
    }
    return crude;
  }

  const findLCL = (TC, TdC, pHP) => {
    const T = TC+273.15;
    const p = pHP*100.0;
    const es = 6.1078*Math.exp((17.269*TC)/(237.3+TC));
    const ee= 6.1078*Math.exp((17.269*TdC)/(237.3+TdC)) ;
    const RH = ee/es;
    const qv = 0.622*ee/(pHP-ee);

    // Parameters
    const Ttrip = 273.16;     // K
    const ptrip = 611.65;    // Pa
    const E0v   = 2.3740e6;   // J/kg
    const E0s   = 0.3337e6;   // J/kg
    const ggr   = 9.81;       // m/s^2
    const rgasa = 287.04;     // J/kg/K
    const rgasv = 461.0;        // J/kg/K
    const cva   = 719.0;      // J/kg/K
    const cvv   = 1418.0;       // J/kg/K
    const cvl   = 4119.0;       // J/kg/K
    const cvs   = 1861.0;       // J/kg/K
    const cpa   = cva + rgasa;
    const cpv   = cvv + rgasv;
    const cpm = (1-qv)*cpa + qv*cpv;
    const Rm = (1-qv)*rgasa + qv*rgasv;

    const a = (cpm/Rm) + (cvl-cpv)/rgasv;
    const b = -(E0v - Ttrip*(cvv-cvl))/(rgasv*T);
    const c = b/a;

    const L = lambert(Math.pow(RH,(1.0/a))*c*Math.exp(c), -1 );
    const Tlcl = T * c * ( Math.pow(L,-1.0 )  )  - 1.0  // The extra 1.0 is tuning
    const LCL = p*(Math.pow((Tlcl/T),(cpm/Rm)))
    const LCLHP = LCL/100.0;

    return LCLHP;
  }

  const closest = (list, x) => {
    let miin;
    let chosen = 0;
    for (var i in list) {
      miin = Math.abs(list[chosen] - x);
      if (Math.abs(list[i] - x) < miin) {
        chosen = i;
      };
    };
    return parseInt(chosen, 10);
  }

  const initialTableValues = () => {
    document.getElementById("sfc-temp").innerText = `${Math.round(Ascent.surfaceTempC)} ℃`
    document.getElementById("parcel-temp").innerText = `${Math.round(Ascent.surfaceTempC)} ℃`
    let RH = 100*(Math.exp((17.625*Ascent.surfaceTdC)/(243.04+Ascent.surfaceTdC))/Math.exp((17.625*Ascent.surfaceTempC)/(243.04+Ascent.surfaceTempC)));
    document.getElementById("sfc-RH").innerText = `${Math.round(RH)}%`
  }

  const parcelAscent = temp => {
    const LCL = findLCL(Ascent.surfaceTempC, Ascent.surfaceTdC, Ascent.surfacePresshPA);
    let Px=[];
    let Tt;
    let dry = true;
    let CAPE = 0;
    const pSfcTemp = temp;
    const p500idx = closest(Ascent.pressurehPA, 500)

    S.P.forEach((p, index) => {
      if ((p > LCL) && (p <= Ascent.surfacePresshPA) ) {
        Tt = (temp+273.15)* ( (Ascent.surfacePresshPA/p)**(-S.Rd/S.Cp) ) - 273.15
        let Tpx = S.w*(Tt - S.minT)/(S.maxT-S.minT);
        let Ppx = S.h*(Math.log(p)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
        if (Ascent.temperatureC[index] > Tt) {
          Px.push([NaN, NaN]);
        } else {
          CAPE += -287.0 * (Tt - Ascent.temperatureC[index]) * (Math.log(p+S.Dp) - Math.log(p));
          Px.push([Tpx, Ppx]);
        }
      } else if (p <= LCL) {
        if (dry) {
          temp = Tt
          dry = false;
        }
        let dt = wetAdiabatGradient(p, temp, S)
        temp+=dt;
        let Tpx = S.w*(temp - S.minT)/(S.maxT-S.minT);
        let Ppx = S.h*(Math.log(p)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
        if (Ascent.temperatureC[index] > temp) {
          Px.push([NaN, NaN]);
        } else {
          CAPE += -287.0 * (temp - Ascent.temperatureC[index]) * (Math.log(p+S.Dp) - Math.log(p));
          Px.push([Tpx, Ppx]);
        }
        if (index == p500idx) {
          let LI = Ascent.temperatureC[index] - temp
          if (LI) {
            LI = Math.round(LI,2);
          } else {
            LI = "";
          }
          document.getElementById("lifted-index").innerHTML = `<span style="opacity: 0.7"> Lifted Index   </span>${LI} ℃`
        }

      }
    });

    if (CAPE) {
      CAPE = Math.round(CAPE,2);
    } else {
      CAPE = "";
    }
    document.getElementById("parcel-cape").innerHTML = `<span style="opacity: 0.7"> CAPE   </span>${CAPE} J/K`


    // skew the isotherms
    Px.forEach((px) => {
      px[0] = px[0] + S.h - px[1];
    });

    let lineGenerator = d3.line();
    let daPathString = lineGenerator(Px);

    d3.selectAll("path#parcelcurve").remove();

    S.svg.append("path")
      .attr("d", daPathString)
      .attr("id", "parcelcurve")
      .style("fill", 'none')
      .style("stroke-width", 4.0*S.strokeFactor)
      .style("stroke", 'red');

    // update the table
    document.getElementById("sfc-temp").innerHTML = `<span style="opacity: 0.7">Sfc temp  </span>${Math.round(Ascent.surfaceTempC)} ℃`
    document.getElementById("parcel-temp").innerHTML = `<span style="opacity: 0.7">Parcel temp   </span>  ${Math.round(pSfcTemp)} ℃`
    let RH = 100*(Math.exp((17.625*Ascent.surfaceTdC)/(243.04+Ascent.surfaceTdC))/Math.exp((17.625*Ascent.surfaceTempC)/(243.04+Ascent.surfaceTempC)));
    document.getElementById("sfc-RH").innerHTML = `<span style="opacity: 0.7">Sfc Rel. Hum.    </span>${Math.round(RH)}%`


    // document.getElementById("parcel-cape").innerText = `${Math.round(CAPE)} J/kg`


  }

  parcelAscent(Ascent.surfaceTempC);


  const drawSlider = () => {
    ///////////    slider    ////////
    let tt = Ascent.surfaceTempC - S.minT;
    let markerTpx = S.w*tt/(S.maxT-S.minT);
    let markerPpx = S.h*(Math.log(Ascent.surfacePresshPA)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
    let markerTx = markerTpx + S.h - markerPpx;

    let valueLine = S.svg.append("line")
        .attr("x1", 0)
        .attr("x2", markerTx)
        .attr("y1", S.h)
        .attr("y2", S.h)
        .attr("id", "filledLineID")
        .style("stroke", 'red')
        .style("stroke-linecap", "round")
        .style("stroke-width", 5*S.strokeFactor);

    //Line to show the remaining value
    let emptyLine = S.svg.append("line")
        .attr("x1", S.w)
        .attr("x2", S.w)
        .attr("y1", S.h)
        .attr("y2", S.h)
        .attr("id", "emptyLineID")
        .style("stroke", 'black')
        .style("stroke-width", 5*S.strokeFactor);

    let valueRect = S.svg.append("circle")
        .attr("cx", markerTx)
        .attr("cy", markerPpx)
        .attr("id", "circleID")
        .attr("r", 7)
        .style("fill", 'purple')
        .call( d3.drag().on("drag", dragEnded));
  };

  const dragEnded = () => {
    let Tbase = Ascent.surfaceTemp;

    let selectedValue = d3.event.x;

    if (selectedValue < 0)
      selectedValue = 0;
    else if (selectedValue > S.w)
      selectedValue = S.w;

    let tt = Tbase - S.minT;
    let markerTpx = S.w*tt/(S.maxT-S.minT);
    let markerPpx = S.h*(Math.log(Ascent.surfacePresshPA)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
    let markerTx = selectedValue + S.h - markerPpx

    markerTx = markerTx - (S.h - markerPpx)

    const valueRect = d3.selectAll("circle#circleID")
    const valueLine = d3.selectAll("line#filledLineID")
    const emptyLine = d3.selectAll("path#emptyLineID")

    valueRect.attr("cx", markerTx);
    valueRect.attr("cy", markerPpx);
    valueLine.attr("x2", markerTx);
    emptyLine.attr("x1", markerTx);

    d3.event.sourceEvent.stopPropagation();

    let NormValue = (selectedValue-(S.h - markerPpx)) / S.w;
    Tbase = S.minT + NormValue*(S.maxT-S.minT);

    // update_table(Tbase);
    let Px = parcelAscent(Tbase)
    valueRect.raise();
  }

  drawSlider();

};

export { parcels }
