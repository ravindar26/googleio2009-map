

# Introduction #

If you attended [Google I/O 2009](http://code.google.com/events/io) a few weeks ago, you may have noticed a kiosk station on the 2nd and 3rd floors of [Moscone West](http://maps.google.com/maps?q=moscone+west&ll=37.783134,-122.402887&z=18) labelled '[Interactive Conference Map](http://code.google.com/events/io/map), powered by [Google Maps](http://maps.google.com)'. The kiosk simply pointed to a [JavaScript Maps API](http://code.google.com/apis/maps)-based interactive map of the venue.

Today, I'm going to run through the steps I went through to create this map, so that you can build a similar application for your own event, venue, campus, or whatever.

First, some prerequisites:

  * [Python 2.5+](http://www.python.org), with [PIL (Python Imaging Library)](http://www.pythonware.com/products/pil/) installed.
  * A basic knowledge of JavaScript and the Google Maps API v2 for JavaScript.

A quick note before we begin, most of the code and Adobe(R) Photoshop(R) sources used in the Google I/O 2009 map are available at [this open source project](http://code.google.com/p/googleio2009-map).


# Step 1: Line up the venue floor plan with Google Maps imagery #

So the first thing you'll want to do is get a high-resolution graphic of the venue floor plan. This part will vary severely by use case, so I won't go into detail on it. For Google I/O, we had a third party contractor design the floor plan.

Next, you'll want to take a few screenshots of the venue in Google Maps at the closest zoom level possible (I used zoom level 21) and import them into your image editor, along with the venue floor plan graphic. You may need to use some image editing wizardry to align multiple Google Maps screenshots into one.

_**Note: we aren't actually going to use any Maps imagery in the final output (that would violate our [Terms of Service](http://code.google.com/apis/maps/terms.html)); we're just using the imagery to help align our venue floor plan.**_

Once you have Maps screenshots and the source graphic in your image editor, rotate and scale your source graphic so that it lines up as closely as possible to the corresponding location in Google Maps. After your floor plan lines up cleanly with Google Maps imagery, remove the Maps imagery so you are just left with the floor plan.

At this point, you may want to add in static text labels onto the floor plan (Note, these won't be clickable in the final application).

_Here's an example of output from this step: [L2\_21.png](http://googleio2009-map.googlecode.com/svn/trunk/tiles/levels-png/L2_21.png)_


# Step 2: Scale down the floor plan for multiple zoom levels #

Now that you have a giant hi-res image that looks good overlayed on top of Google Maps imagery at a high zoom level such as 21, you'll want to scale it down several times for several smaller zoom levels (20, 19, 18, etc.).

Since imagery at zoom level `n - 1` is 50% the width and height of corresponding imagery at zoom level `n`, you can simply scale down your hi-res image by 50% repeatedly to create the lower zoom levels.

One thing to note is that, if you added static text labels, you'll probably want to keep those from scaling down in size, because otherwise you'd end up with unreadable text. Also, if your text labels start to clutter the map, you should probably selectively remove labels of lesser importance at lower zoom levels.

_Here's an example of output from this step: [L2\_20.png](http://googleio2009-map.googlecode.com/svn/trunk/tiles/levels-png/L2_20.png), [L2\_19.png](http://googleio2009-map.googlecode.com/svn/trunk/tiles/levels-png/L2_19.png), [L2\_18.png](http://googleio2009-map.googlecode.com/svn/trunk/tiles/levels-png/L2_18.png)_

# Step 3: Register an anchor point in your floor plan images with a latitude/longitude #

Now that you have a floor plan image for different zoom levels, you'll need to register a point on your venue floor plan to a latitude/longitude. To do this, visit a site like [getlatlon.com](http://www.getlatlon.com) to get the latitude and longitude of a point somewhere along the edges of the venue location. We'll call these the 'anchor' latitude and longitude.

Then, compute the (x, y) of the same point in your highest zoom level floor plan image as a fraction. For example, if your largest floor plan image is 3000x2000 and the point on the floor plan corresponding to the anchor lat/lon is at (1000, 1000) then your (x, y) as a fraction is (0.33333, 0.5).

# Step 4: Run `gmaps-tiler.py` on your images to generate Maps API tiles #

Now that you have the floor plan images, an anchor (x, y) and anchor lat/lon, you're ready to make some tiles for the Google Maps API using the `gmaps-tiler.py` script.

Download the [gmaps-tiler.py](http://code.google.com/p/googleio2009-map/source/browse/trunk/tiles/gmaps-tiler.py) script and run this command for each zoom level from your shell/command prompt, replacing the values in italics with information from the previous steps:

```
   python gmaps-tiler.py <floorplan-image-for-zoom-level> <zoom level> <anchor-latitude>,<anchor-longitude> <anchor-x>,<anchor-y> <output-format>.png
```

For example, running this command with these paramters:

```
   python gmaps-tiler.py L2_18.png 18 37.78384,-122.40389 0.58278,0.00647 "output/L2_%z_%x_%y.png"
```

will create images such as [L2\_18\_41940\_101316.png](http://googleio2009-map.googlecode.com/svn/trunk/tiles/out/L2_18_41940_101316.png).

A more complex sample usage of `gmaps-tiler.py` can be found by looking through the [maketiles.sh](http://code.google.com/p/googleio2009-map/source/browse/trunk/tiles/maketiles.sh) source file.

# Step 5: Write some fancy JavaScript using the Maps API and `GTileLayerOverlay` #

At this point, you've got tiles ready for consumption in the Google Maps API. Getting custom tiles into a JavaScript Maps API application is pretty simple with the [GTileLayerOverlay](http://code.google.com/apis/maps/documentation/reference.html#GTileLayerOverlay) and [GTileLayer](http://code.google.com/apis/maps/documentation/reference.html#GTileLayer) classes. All you need to do is create a class that extends `GTileLayer` and implements the `getTileUrl` method to tell Maps how to get to your generated tile set. Here's a pseudo-excerpt:

```
MyTileLayer.prototype.getTileUrl = function(tile, resolution) {
  ...
  
  var template = 'http://path/to/your/tiles/output/L2_{Z}_{X}_{Y}.png';
  return template
      .replace('{Z}', resolution) // zoom level
      .replace('{X}', tile.x)
      .replace('{Y}', tile.y);
};
```

For a full example of implementing `GTileLayer`, check out the [mallmaptilelayer.js](http://code.google.com/p/googleio2009-map/source/browse/trunk/app/js/mallmaptilelayer.js) source file.

The rest is really up to you; check out the [full source of the Google I/O 2009 interactive map](http://code.google.com/p/googleio2009-map/source/browse/trunk/#trunk/app) for more code and creative ideas.

# Bonus Step: Use the Spreadsheets API for storing marker data #

You may also notice that there are extra content in the form of Maps markers that appear above the map for each floor in Moscone West. These markers are stored in [Google Spreadsheets](http://docs.google.com) in [a very basic format](http://code.google.com/p/googleio2009-map/source/browse/trunk/spreadsheet-content.csv) (click for CSV) and are fetched via JavaScript using [JSONP](http://en.wikipedia.org/wiki/JSON#JSONP). The majority of the code used for this can be found in the [content.js](http://code.google.com/p/googleio2009-map/source/browse/trunk/app/js/content.js) source file with the marker creation code in [index.js](http://code.google.com/p/googleio2009-map/source/browse/trunk/app/js/index.js) (look for `createContentMarker`).

For more information on using the [Google Spreadsheets Data API](http://code.google.com/apis/spreadsheets/) in Maps, see [this demo application](http://gmaps-samples.googlecode.com/svn/trunk/spreadsheetsmapwizard/makecustommap.htm).