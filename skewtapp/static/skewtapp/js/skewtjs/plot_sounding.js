const plotSounding = (Ascent, S) => {
  let i;

  document.getElementById("station-label").innerText = `${Ascent.station_name} (${Ascent.wmo_id})`
  document.getElementById("date").innerText = `${Ascent.sonde_validtime}`

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

  const imposeNaN = (arr) => {
    let newarr = [];
    arr.forEach(i => {
      if (i==-9999) {
        newarr.push(NaN);
      } else {
        newarr.push(i);
      }
    });
    return newarr;
  }

  const firstValue = (arr) => {
    for(var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        return arr[i];
      }
    };
  }

  const interpolateSounding = (data) => {
    let newT = [];
    let newTd = [];
    let newU = [];
    let newV = [];
    let higherP, lowerP, higherT, lowerT, higherTd, lowerTd, higherU, higherV, lowerU, lowerV;
    data.surfacePresshPA = data.pressurehPA[0];
    data.surfaceTempC = data.temperatureK[0] - 273.15;
    data.surfaceTdC = data.dewpointK[0] - 273.15;
    data.u_windMS = imposeNaN(data.u_windMS)
    data.v_windMS = imposeNaN(data.v_windMS)
    S.P.forEach((p,index) => {
      let cidx = closest(data.pressurehPA, p)
      if (p > data.pressurehPA[0]) {
        newT.push(NaN);
        newTd.push(NaN);
        newU.push(NaN);
        newV.push(NaN);
      } else {
        if (p < data.pressurehPA[cidx]) {
          higherP = data.pressurehPA[cidx+1];
          higherT = data.temperatureK[cidx+1];
          higherTd = data.dewpointK[cidx+1];
          higherU = data.u_windMS[cidx+1];
          higherV = data.v_windMS[cidx+1];
          lowerP = data.pressurehPA[cidx];
          lowerT = data.temperatureK[cidx];
          lowerTd = data.dewpointK[cidx];
          lowerU = data.u_windMS[cidx];
          lowerV = data.v_windMS[cidx];
        } else {
          higherP = data.pressurehPA[cidx];
          higherT = data.temperatureK[cidx];
          higherTd = data.dewpointK[cidx];
          higherU = data.u_windMS[cidx];
          higherV = data.v_windMS[cidx];
          lowerP = data.pressurehPA[cidx-1];
          lowerT = data.temperatureK[cidx-1];
          lowerTd = data.dewpointK[cidx-1];
          lowerU = data.u_windMS[cidx-1];
          lowerV = data.v_windMS[cidx-1];
        }
        let alpha = (p - lowerP) / (higherP - lowerP);
        let t = alpha * (higherT - lowerT) + lowerT;
        let td = alpha * (higherTd - lowerTd) + lowerTd;
        let u = alpha * (higherU - lowerU) + lowerU;
        let v = alpha * (higherV - lowerV) + lowerV;
        newT.push(t - 273.15);
        newTd.push(td - 273.15);
        newU.push(u * 1.94384);
        newV.push(v * 1.94384);
      }
    });
    data.pressurehPA = S.P;
    data.temperatureC = newT;
    data.dewpointC = newTd;
    data.u_windKT = newU;
    data.v_windKT = newV;

    data.surfaceUKT = firstValue(newU);
    data.surfaceVKT = firstValue(newV);

    return data;
  }

  Ascent = interpolateSounding(Ascent);

  const plotSounding = () => {
    let Px=[]; let Pdx=[];
     //// T
    for (let i = 0; i < Ascent.pressurehPA.length; i++) {
      let Tnew = Ascent.temperatureC[i] - S.minT;
      let Tpx = S.w*Tnew/(S.maxT-S.minT);
      let Ppx = S.h*(Math.log(Ascent.pressurehPA[i])-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
      if ((Ppx) && (Tpx)) {
        Px.push([Tpx, Ppx]);
      }
    }
    Px.forEach((px) => {
      px[0] = px[0] + S.h - px[1];
    });
    /////  Td
    for (i = 0; i < Ascent.pressurehPA.length; i++) {
      let Tnew = Ascent.dewpointC[i] - S.minT;
      let Tdpx = S.w*Tnew/(S.maxT-S.minT);
      let Ppx = S.h*(Math.log(Ascent.pressurehPA[i])-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
      if ((Ppx) && (Tdpx)) {
        Pdx.push([Tdpx, Ppx]);
      }
    }
    Pdx.forEach((pdx) => {
      pdx[0] = pdx[0] + S.h - pdx[1];
    });

    let lineGenerator = d3.line();
    let pathString = lineGenerator(Px);
    S.svg.append("path")
      .attr('d', pathString)
      .attr('id', 'SdTPath')
      .style("fill", 'none')
      .style("stroke-width", 4*S.strokeFactor)
      .style("stroke", 'black');

    let pathStringTd = lineGenerator(Pdx);
    S.svg.append("path")
      .attr('d', pathStringTd)
      .style("fill", 'none')
      .attr('id', 'SdTdPath')
      .style("stroke-width", 4*S.strokeFactor)
      .style("stroke-dasharray", ("8, 4"))
      .style("stroke", 'black');
  }

  plotSounding();
  return Ascent


};

export { plotSounding };
