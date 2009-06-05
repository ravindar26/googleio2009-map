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

/**
 * Global GMap2 instance.
 */
var map;

/**
 * Available level codes.
 */
var LEVELS = ['1', '2', '3'];

/**
 * The currently being viewed level code.
 */
var curLevel = null;

/**
 * GTileLayerOverlays for given floor levels.
 */
var levelOverlays = {};

/**
 * Mall map content (the underyling data behind the map markers),
 * as an array of object literals.
 */
var mallmapContent = [];

/**
 * DOM and JSAPI post-init function.
 */
function init() {
  map = new google.maps.Map2(document.getElementById('map_canvas'));
  map.setCenter(new google.maps.LatLng(37.78313383211993, -122.40394949913025),
                18);

  var mapUI = map.getDefaultUI();
  mapUI.maptypes.normal = false;
  mapUI.maptypes.satellite = true;
  mapUI.maptypes.hybrid = false;
  mapUI.maptypes.physical = false;
  mapUI.controls.maptypecontrol = false;
  mapUI.controls.menumaptypecontrol = false;
  map.setUI(mapUI);
  map.setMapType(G_HYBRID_MAP);

  // Load the tile layers.
  registerIOMallMapTileLayer();

  for (var i = 0; i < LEVELS.length; i++) {
    var level = LEVELS[i];
    levelOverlays[level] = new google.maps.TileLayerOverlay(
                               new IOMallMapTileLayer(level));
  }

  // Load the mall map content (markers).
  loadMallMapContent(function(contentItems) {
    for (var i = 0; i < contentItems.length; i++) {
      var marker = createContentMarker(contentItems[i]);
      contentItems[i].marker = marker;
      map.addOverlay(marker);
    }

    mallmapContent = contentItems;

    // Turn on the first level (floor 1).
    if (!document.location.hash) {
      switchLevel(LEVELS[0]);
    }

    // Load the initial location hash and watch for changes.
    initLocationHashWatcher();
  });
}

/**
 * Watches the document location hash for changes and loads the corresponding
 * view state.
 */
function initLocationHashWatcher() {
  var curHash = null;

  setInterval(function() {
    if (curHash == document.location.hash) {
      return;
    }

    // Hash changed, load the view state.
    curHash = document.location.hash;

    var m = curHash.match(/level(\d)(?:\:([\w-]+))?/);
    if (m && m[1]) {
      if (curLevel != m[1]) {
        switchLevel(m[1]);
      }

      if (m[2]) {
        // Look for the content with this ID
        for (var i = 0; i < mallmapContent.length; i++) {
          if (mallmapContent[i].id == m[2]) {
            openContentInfo(mallmapContent[i], true);
            break;
          }
        }
      } else {
        map.closeInfoWindow();
      }
    }

  }, 100);
}

/**
 * Sets the document location hash to the given level and optional content id.
 */
function updateLocationHash(level, id) {
  document.location.hash = 'level' + level + (id ? ':' + id : '');
}

/**
 * Switches to the given level/floor.
 */
function switchLevel(level) {
  if (curLevel == level) {
    return;
  }

  map.closeInfoWindow();

  if (curLevel) {
    map.removeOverlay(levelOverlays[curLevel]);
  }

  // Show the tile layer for this level.
  curLevel = level;
  map.addOverlay(levelOverlays[level]);

  // Show all markers for this level.
  for (var i = 0; i < mallmapContent.length; i++) {
    var contentItem = mallmapContent[i];
    if (contentItem.floors[level]) {
      contentItem.marker.show();
    } else {
      contentItem.marker.hide();
    }
  }

  // Select the appropriate button.
  $('.level-button').each(function() {
    if (this.id == 'btn-level' + level) {
      $(this).addClass('selected');
    } else {
      $(this).removeClass('selected');
    }
  });

  updateLocationHash(curLevel);
}

/**
 * Creates a marker for the given content item. The marker will initially
 * be hidden.
 */
function createContentMarker(contentItem) {
  var icon = new google.maps.Icon();
  icon.image = 'images/marker-' + contentItem.icon + '.png';
  icon.shadow = 'images/marker-shadow.png';
  icon.iconSize = new google.maps.Size(30, 28);
  icon.shadowSize = new google.maps.Size(30, 28);
  icon.iconAnchor = new google.maps.Point(13, 26);
  icon.infoWindowAnchor = new google.maps.Point(13, 0);

  var latlng = new google.maps.LatLng(contentItem.latitude,
                                      contentItem.longitude);
  var marker = new google.maps.Marker(latlng, {
    hide: true,
    icon: icon,
    title: contentItem.name
  });

  google.maps.Event.addListener(marker, 'click', function() {
    openContentInfo(contentItem);
  });

  return marker;
}

/**
 * Opens the given content item's info window, optionally centering on it.
 * The content item should be on the current floor for this to take affect.
 */
function openContentInfo(contentItem, centerTo) {
  var tabs = [];
  for (var i = 0; i < contentItem.tabs.length; i++) {
    tabs.push(new google.maps.InfoWindowTab(
        contentItem.tabs[i].title,
        '<div class="infowindow">' + contentItem.tabs[i].content + '</div>'));
  }

  var date = new Date();
  var isMay28 = (2009 == date.getFullYear() &&
                 (5 - 1) == date.getMonth() &&
                 28 == date.getDate());

  // Can't use marker.openInfoWindow.. because it doesn't support onCloseFn.
  map.openInfoWindowTabsHtml(contentItem.marker.getLatLng(), tabs, {
    onCloseFn: function() {
      updateLocationHash(curLevel);
    },
    maxWidth: contentItem.infoMaxWidth || 300,
    selectedTab: (contentItem.tabs[0].title == 'Wed' && isMay28) ? 1 : 0
  });

  if (centerTo) {
    var latlng = new google.maps.LatLng(contentItem.latitude,
                                        contentItem.longitude);
    map.panTo(latlng);
  }

  updateLocationHash(curLevel, contentItem.id);
}
