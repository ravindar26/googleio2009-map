/*
Copyright 2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var BASE_TILE_URL = 'http://path/to/your/tiles/out/';

function registerIOMallMapTileLayer() {
  var RESOLUTION_BOUNDS = {
    16: [[10484, 10485], [25328, 25329]],
    17: [[20969, 20970], [50657, 50658]],
    18: [[41939, 41940], [101315, 101317]],
    19: [[83878, 83881], [202631, 202634]],
    20: [[167757, 167763], [405263, 405269]]
    //21: [[335514, 335526], [810527, 810539]]
  };

  var TILE_URL_TEMPLATE = BASE_TILE_URL + 'L{L}_{Z}_{X}_{Y}.png';
  var SIMPLE_TILE_URL_TEMPLATE = BASE_TILE_URL + '{Z}_{X}_{Y}.png';

  /**
   * Constructs a new Google I/O 2009 Mall Map layer. The content of this layer
   * should be an overlay atop Moscone West in San Francisco, CA.
   */
  var IOMallMapTileLayer = function(floorLevel, copyrights, minResolution,
                                    maxResolution, options) {
    this.floorLevel = floorLevel;
    google.maps.TileLayer.call(
        this, copyrights, minResolution, maxResolution, options);
  };

  IOMallMapTileLayer.prototype = new google.maps.TileLayer();

  IOMallMapTileLayer.prototype.minResolution = function() {
    return 16;
  }

  IOMallMapTileLayer.prototype.maxResolution = function() {
    return 20;
  }

  IOMallMapTileLayer.prototype.isPng = function() {
    return true;
  }

  IOMallMapTileLayer.prototype.getOpacity = function() {
    return 1.0;
  }

  IOMallMapTileLayer.prototype.getCopyright = function(bounds, resolution) {
    return '';
  }

  IOMallMapTileLayer.prototype.getTileUrl = function(tile, resolution) {
    // Ensure that the requested resolution exists for this tile layer.
    if (this.minResolution() > resolution ||
        resolution > this.maxResolution()) {
      return '';
    }

    // Ensure that the requested tile x,y exists.
    if ((RESOLUTION_BOUNDS[resolution][0][0] > tile.x ||
         tile.x > RESOLUTION_BOUNDS[resolution][0][1]) ||
        (RESOLUTION_BOUNDS[resolution][1][0] > tile.y ||
         tile.y > RESOLUTION_BOUNDS[resolution][1][1])) {
      return '';
    }

    var template = TILE_URL_TEMPLATE;
    if (16 <= resolution && resolution <= 17) {
      template = SIMPLE_TILE_URL_TEMPLATE;
    }

    return template
        .replace('{L}', this.floorLevel)
        .replace('{Z}', resolution)
        .replace('{X}', tile.x)
        .replace('{Y}', tile.y);
  }

  window.IOMallMapTileLayer = IOMallMapTileLayer;
}
