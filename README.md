# Skewt (Tephigrams)

*Visualizing the upper atmosphere*

<img src="https://github.com/johnckealy/skewtfrontend/blob/master/skewtapp/static/skewtapp/images/example_tephi.jpg" alt="skewt" width="350px" height="300px">


SkewT is an upgraded version of [tephigrams.org](https://tephigrams.org), now live under the domain skewt.org. It consumes a django REST API for it's data, which can be found at [api.skewt.org](https://api.skewt.org/api/available). 

The site is mostly vanilla javascript for the calculation of the thermodynamic quantities, and d3.js for the visualizations. 

#### What's a skewt/tephigram?

The solid black line represents temperature, and the dashed black line represents dew point temperature. **If you drag the purple slider at the bottom, this will show how a parcel of air would ascend.** With a little practice, you can use a SkewT oor a tephigram to tell the cloud amounts, thermals, upper level winds, turbulence, icing, thunderstorm development potential, shear, and many other quantities – for the informed user, this diagram can tell you more about the atmosphere than any other single tool. 

SkewT's and tephigrams are very similar, the main difference being that the pressure isobars (decreasing with height) are straight in a skewT, while with a tephigram is it the lines representing entropy that are straight (though these are skewed 45° to the left.)

#### Data source

Data is taken from the USA's National Oceanic and Atmospheric Administration (NOAA) observational data ingest system, know as MADIS. MADIS gives the data through a file system over http, so skewt's backend (api.skewt.org) uses python to open, date, quality control, and save the desired data into its postgreSQL database, without overburdening the source. 
