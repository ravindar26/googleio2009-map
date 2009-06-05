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
 * The current loadMallMapContent application-specific callback.
 */
var LOAD_MALL_MAP_CONTENT_CALLBACK = null;

/**
 * The Google Spreadsheets doc key and sheet ID.
 */
var SPREADSHEET_KEY_AND_WSID = 'rgeSfBEySkmJ-DDB2zVXodg/od6';

/**
 * Loads markers from the I/O conference map spreadsheet.
 */
function loadMallMapContent(callback) {
  LOAD_MALL_MAP_CONTENT_CALLBACK = callback;

  // Initiate a JSONP request.
  var jsonpUrl = 'http://spreadsheets.google.com/feeds/list/' +
      SPREADSHEET_KEY_AND_WSID + '/public/values' +
      '?alt=json-in-script&callback=loadMallMapContentContinuation';
  var script = document.createElement('script');
  script.setAttribute('src', jsonpUrl);
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}

/**
 * Helper function that removes whitespace from the start and end of a string.
 */
if (!window.trim) {
  window.trim = function(s) {
    return s.replace(/(^\s+)|(\s+$)/g, '');
  };
}

/**
 * JSONP callback for when data is available.
 */
function loadMallMapContentContinuation(json) {
  var contentItems = [];
  var ids = {};

  function name2id(name) {
    var num = 1;
    var id = name.replace(/\s/g, '-').replace(/[^\w-]/g, '').toLowerCase();
    var tid = id;
    while (tid in ids) {
      ++num;
      tid = id + num.toString();
    }

    return tid;
  }

  var entries = json.feed.entry;
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    try {
      if (entry.gsx$display.$t.toLowerCase() !== 'true') {
        continue;
      }

      var item = {};

      // Load content item basics.
      item.latitude = parseFloat(entry.gsx$latitude.$t);
      item.longitude = parseFloat(entry.gsx$longitude.$t);
      item.name = trim(entry.gsx$name.$t);
      item.id = name2id(item.name);
      item.icon = trim(entry.gsx$icon.$t);

      item.floors = {};

      var floors = entry.gsx$floors.$t.split(',');
      for (var j = 0; j < floors.length; j++) {
        var floor = trim(floors[j]);
        item.floors[floor] = true;
      }

      if (entry.gsx$infomaxwidth && parseInt(entry.gsx$infomaxwidth.$t)) {
        item.infoMaxWidth = parseInt(entry.gsx$infomaxwidth.$t);
      }

      item.tabs = [];

      // Load content item info window content (tabs).
      var curTab = 1;
      while (true) {
        if (!entry['gsx$tab' + curTab + 'title']) {
          break;
        }

        var tabTitle = trim(entry['gsx$tab' + curTab + 'title'].$t);
        var tabContent = entry['gsx$tab' + curTab + 'content'].$t;
        if (!tabTitle && !tabContent) {
          break;
        }

        item.tabs.push({
          title: tabTitle,
          content: tabContent
        });

        ++curTab;
      }

      contentItems.push(item);
      ids[item.id] = true;
    } catch (e) {
      if (console && console.log) {
        console.log('Error with entry titled "' + entry.title.$t + '"');
      }
    }
  }

  LOAD_MALL_MAP_CONTENT_CALLBACK(contentItems);
}
