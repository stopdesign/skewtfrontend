const drawIsobar = (pLine, S) => {

  let Tpx = S.w*(S.maxT - S.minT)/(S.maxT-S.minT);
  let Ppx = S.h*(Math.log(pLine)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
  let Px = [[0, Ppx], [Tpx, Ppx]]

  let lineGenerator = d3.line();
  let isoPathString = lineGenerator(Px);

  const strId = `p${pLine}textid`
  S.svg.append("path")
    .attr('id', strId)
    .attr('d', isoPathString)
    .style("fill", 'none')
    .style("stroke-width", 1.5*S.strokeFactor)
    .style("stroke", 'green');
  S.svg.append("text")
    .append("textPath")
    .style("font-size", S.isoPlethFont)
    .style('fill', "green")
    .attr("x", 20)
    .attr("y", -10)  // why wont this work?
    .attr("xlink:href", "#"+strId)
    .text('\xa0\xa0\xa0\xa0\xa0'+`${pLine} hPa`);
}


const drawIsotherm = (temp, S) => {
  let Px = [];
  // convert to pixel coordinates
  S.P.forEach(p => {
    let Tpx = S.w*(temp - S.minT)/(S.maxT-S.minT);
    let Ppx = S.h*(Math.log(p)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
    Px.push([Tpx, Ppx]);
  });

  // skew the isotherms
  Px.forEach((px) => {
    px[0] = px[0] + S.h - px[1]
  });
  let lineGenerator = d3.line();
  let pathString3 = lineGenerator(Px);

  const strId = 'textid'+temp

  S.svg.append("path")
    .attr('id', strId)
    .attr('d', pathString3)
    .style("fill", 'none')
    .style("stroke-width", 1*S.strokeFactor)
    .style("stroke", 'green');

  // color zero degree isotherm in blue
  if (temp == 0) {
    S.svg.select('#'+strId)
      .style("stroke-width", 1.2*S.strokeFactor)
      .style("stroke", 'blue');
  }

  S.svg.append("text")
    .style("font-size", S.isoPlethFont)
    .style('fill', "green")
    .attr("y",-5)
    .append("textPath")
    .attr("xlink:href", "#"+strId)
    .text('\xa0\xa0\xa0\xa0\xa0\xa0'+temp+' C');
};

const drawDryAdiabat = (temp, S) => {
  let Px=[];
  S.P.forEach(p => {
    let Tt = (temp+273.15)* ( (1000.0/p)**(-S.Rd/S.Cp) ) - 273.15
    let Tpx = S.w*(Tt - S.minT)/(S.maxT-S.minT);
    let Ppx = S.h*(Math.log(p)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
    Px.push([Tpx, Ppx]);
  });
  // skew the isotherms
  Px.forEach((px) => {
    px[0] = px[0] + S.h - px[1];
  });

  let lineGenerator = d3.line();
  let daPathString = lineGenerator(Px);

  S.svg.append("path")
    .attr('d', daPathString)
    .style("fill", 'none')
    .style("stroke-width", 1*S.strokeFactor)
    .style("stroke", 'green');
};


const wetAdiabatGradient = (pressure, temp, S) => {
  const K = 0.286;
  const L = 2.5e6;
  const MA = 300.0;
  const RV = 461.0;

  temp += 273.15;
  let lsbc = (L / RV) * ((1.0 / 273.15) - (1.0 / temp));
  let rw = 6.11 * Math.exp(lsbc) * (0.622 / pressure);
  let lrwbt = (L * rw) / (S.Rd * temp);
  let nume = ((S.Rd * temp) / (S.Cp * pressure)) * (1.0 + lrwbt);
  let deno = 1.0 + (lrwbt * ((0.622 * L) / (S.Cp * temp)));
  let gradi = nume / deno;

  return S.Dp * gradi;
}


const drawMoistAdiabat = (temp, S) => {
  let Px=[];
  S.P.forEach(p => {
    let dt = wetAdiabatGradient(p, temp, S)
    temp+=dt;
    let Tpx = S.w*(temp - S.minT)/(S.maxT-S.minT);
    let Ppx = S.h*(Math.log(p)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
    Px.push([Tpx, Ppx]);
  });

  // skew the isotherms
  Px.forEach((px) => {
    px[0] = px[0] + S.h - px[1];
  });

  let lineGenerator = d3.line();
  let daPathString = lineGenerator(Px);

  S.svg.append("path")
    .attr('d', daPathString)
    .style("fill", 'none')
    .style("stroke-width", 1*S.strokeFactor)
    .style("stroke", 'green');
};


const drawIsohume = (q, S) => {
  let Px=[];
  let temp;
  // convert to pixel coordinates
  S.P.forEach(p => {
    let es = (p*q)/(q+622.0)
    let logthing = Math.pow((Math.log(es/6.11)),(-1.0))
    temp = Math.pow(((17.269/237.3)*(logthing - (1.0/17.269)) ),(-1.0)  )
    let Tpx = S.w*(temp - S.minT)/(S.maxT-S.minT);
    let Ppx = S.h*(Math.log(p)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));

    let TH = ((273.15+(temp - S.minT))*Math.pow((1000.0/p),-0.286)) - 273.15;
    Px.push([Tpx, Ppx]);
  });
  // skew the isotherms
  Px.forEach((px) => {
    px[0] = px[0] + S.h - px[1];
  });
  let lineGenerator = d3.line();
  let pathStringQ = lineGenerator(Px);

  let strID = temp+'textid'

  S.svg.append("path")
    .attr('id', strID)
    .attr('d', pathStringQ)
    .style("fill", 'none')
    .style("stroke-width", 1*S.strokeFactor)
    .style("stroke-dasharray", ("15, 8"))
    .style("stroke", 'green');

  S.svg.append("text")
    .style("font-size", "11px")
    .style('fill', "green")
    .attr("y",-5)
    .append("textPath")
    .attr("xlink:href", "#"+strID)
    .text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0'+q+' g/kg');
};


const drawIsolines = (S) => {
  for (let p=100; p<=1000; p+=100) { drawIsobar(p, S); }
  for (let T=-80; T<=40; T+=10) { drawIsotherm(T, S); }
  for (let a=-30; a<=150; a+=10) { drawDryAdiabat(a, S); }
  [-27.0, -17.0, -7, 2.6, 12.15, 21.8, 31.6, 40].forEach(m => { drawMoistAdiabat(m, S); });
  [0.001, 0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 8.0, 12.0, 16.0, 20.0].forEach(q => { drawIsohume(q, S); });
};


export { drawIsolines }
export { wetAdiabatGradient }
