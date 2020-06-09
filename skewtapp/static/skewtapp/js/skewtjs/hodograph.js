
  const w = document.getElementById("hodo").offsetWidth;
  const h = document.getElementById("hodo").offsetHeight;


  function hodoCircle(radius) {
    var circle = svg.append("circle")
      .attr("cx", w/2)
      .attr("cy", h/2)
      .attr("r", radius)
      .attr("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", "1px")
  }

  function hodoLine(Px) {
    let lineGenerator = d3.line();
    let pathString = lineGenerator(Px);
    svg.append("path")
      .attr('d', pathString)
      .style("fill", 'none')
      .style("stroke-width", "1px")
      .style("stroke", 'black');
  }


  P = [1000, 800, 600, 400]
  U = [5, 14.3, -8.9, -9.1]
  V = [5, -14.5, -7,3, 12.3]

  outerCircleWS = 30

  var svg = d3.select("#hodo")
    .append("svg")
    .attr("width", w)
    .attr("height", h);


  hodoLine([ [0, h/2], [w, h/2] ]);
  hodoLine([ [w/2, 0], [w/2, h] ]);
  hodoCircle( (w/2)*1.0 );
  hodoCircle( (w/2)*0.4 );


  var oldI = (w/2) * (U[0] / outerCircleWS);
  var oldJ = (h/2) * (V[0] / outerCircleWS);
  P.forEach((p,index) => {
    var i = (w/2) * (U[index] / outerCircleWS);
    var j = (h/2) * (V[index] / outerCircleWS);
    hodoLine([ [oldI+(w/2), (h/2)-oldJ], [i+(w/2), (h/2)-j] ]);
    oldI = i;
    oldJ = j;
  });
