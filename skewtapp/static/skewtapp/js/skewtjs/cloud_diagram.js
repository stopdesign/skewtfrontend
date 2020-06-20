const clouds = (Ascent, S) => {

  const w = document.getElementById("clouds").clientWidth;
  const h = document.getElementById("clouds").clientHeight;

  const svg = d3.select("#clouds").append("svg")
    .attr('id', 'can')
    .attr("width", w)
    .attr("height", h);

  const closest = (list, x) => {
    let miin;
    let chosen = 0;
    for (var i in list) {
      if (list[i]) {
        miin = Math.abs(list[chosen] - x);
        if (Math.abs(list[i] - x) < miin) {
          chosen = i;
        };
      } else {
        chosen+=1;
      }
    };
    return parseInt(chosen, 10);
  }

  const draw_isohypse = (Z) => {
      let cloudP = Ascent.surfacePresshPA*Math.exp(-Z/10000.0);
      let cloudPpx = h*(Math.log(cloudP)-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
      let d_isoline = "M 0.0,"+cloudPpx+" 600, "+cloudPpx;

      svg.append("path")
        .attr("fill", "None")
        .attr("id", cloudPpx+"ID")
        .attr("stroke", "green")
        .attr( "opacity", 0.7 )
        .style("stroke-dasharray", ("6, 3"))
        .attr("d", d_isoline);

      // Add a text label.
      svg.append("text")
         .attr("x",w-60)
         .attr("y",-5)
         .append("textPath")
         .attr("fill", "green")
         .attr("fill-opacity", 0.7 )
         .style("font-size", "13px")
         .attr("xlink:href","#"+cloudPpx+"ID")
         .text(Z+" m");

                // Add a text label.
      svg.append("text")
        .attr("x",20)
        .attr("y",-5)
        .append("textPath")
        .attr("fill", "green")
        .attr("fill-opacity", 0.7 )
        .style("font-size", "13px")
        .attr("xlink:href","#"+cloudPpx+"ID")
        .text(Math.round(Z*3.28084)+" ft");
  }

  [0, 1500, 5000, 8000, 12000, 15000, 18000].forEach(z => {
    draw_isohypse(z);
  });

  // zero degree isotherm
  let idx = closest(Ascent.temperatureC, 0)
  let cloudPpx = h*(Math.log(Ascent.pressurehPA[idx])-Math.log(S.minP))/(Math.log(S.maxP)-Math.log(S.minP));
  let d_isoline = "M 0.0,"+cloudPpx+" 600, "+cloudPpx;
  svg.append("path")
    .attr("fill", "None")
    .attr("id", cloudPpx+"ID")
    .attr("stroke", "black")
    .attr( "opacity", 0.7 )
    .attr("d", d_isoline);

  // Add a text label.
  svg.append("text")
    .attr("x",5)
    .attr("y",-5)
    .append("textPath")
    .attr("fill", "black")
    .attr("fill-opacity", 0.7 )
    .style("font-size", "13px")
    .attr("xlink:href","#"+cloudPpx+"ID")
    .text("0 ℃");
}

export {clouds};
