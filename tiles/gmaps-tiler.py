#!/usr/bin/env python
#
# Copyright 2009 Google Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#      http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import math
import sys
import re
import os.path

from PIL import Image


TILE_SIZE = 256
MERC_MAX_Y = math.pi  # MAX_LAT = 85.05113

N = 0
E = 1
S = 2
W = 3


def project(lat, lon):
  """Projects the given lat/lon to bent mercator image
  coordinates [-1,1] x [-1,1]."""
  return (lon / 180.0, math.log(
      math.tan(math.pi / 4 + (lat * math.pi / 180.0) / 2)) / MERC_MAX_Y)


def unproject(x, y):
  """Unprojects the given bent mercator image coordinates [-1,1] x [-1,1] to
  the lat/lon space."""
  return ((2 * math.atan(math.exp(y * MERC_MAX_Y)) - math.pi / 2)
      * 180.0 / math.pi, x * 180)


def tile_bbox(x, y, z):
  """Gets the lat/lon box (n, e, s, w) of the given tile."""
  tz = pow(2, z)
  n, w = unproject(2.0 * x / tz - 1,
                   1 - 2.0 * y / tz)
  s, e = unproject(2.0 * (x + 1) / tz - 1,
                   1 - 2.0 * (y + 1) / tz)
  return (n, e, s, w)


def tile_xy(lat, lon, z):
  """Gets the x and y of the tile containing the given lat/lon at
  zoom level z."""
  x, y = project(lat, lon)
  tz = pow(2, z)
  return (int(min(tz - 1, math.floor((x + 1.0) / 2.0 * tz))),
          int(min(tz - 1, math.floor((1.0 - y) / 2.0 * tz))))


def main():
  if len(sys.argv) < 5:
    print >> sys.stderr, ('Usage: %s <image> <zoom> <anchor-lat,anchor-lon> ' +
                          '<anchor-x,anchor-y> [<format>]') % sys.argv[0]
    raise SystemExit

  orig_im = Image.open(sys.argv[1])
  orig_size = orig_im.size

  z = int(sys.argv[2])
  max_pixels = TILE_SIZE * pow(2, z)

  # ix,iy's are image x/y in [0,1]
  anchor_lat, anchor_lon = [float(c) for c in sys.argv[3].split(',')] 
  anchor_ix, anchor_iy = [float(c) for c in sys.argv[4].split(',')]
  
  anchor_ix = round(anchor_ix * orig_size[0])
  anchor_iy = round(anchor_iy * orig_size[0])

  format = '%f_%z_%x_%y.png'
  if len(sys.argv) >= 6:
    format = sys.argv[5]
  
  # wx,wy's are world x/y in [-1,1]
  # the 2 * ... everywhere is because wx,wy's are in the range
  # [-1,1] not [0,1], so the span of the range is 2 and not 1.
  anchor_wx, anchor_wy = project(anchor_lat, anchor_lon)

  image_wx = anchor_wx - 2 * anchor_ix / max_pixels
  image_wy = anchor_wy + 2 * anchor_iy / max_pixels
  
  # n/w/s/e
  image_n, image_w = unproject(image_wx, image_wy)
  
  image_s, image_e = unproject(
      image_wx + 2 * (orig_size[0] - anchor_wx) / max_pixels,
      image_wy - 2 * (orig_size[1] - anchor_wy) / max_pixels)

  start_tx, start_ty = tile_xy(image_n, image_w, z)
  end_tx, end_ty = tile_xy(image_s, image_e, z)
  
  for tx in range(start_tx, end_tx + 1):
    for ty in range(start_ty, end_ty + 1):
      tn, __, __, tw = tile_bbox(tx, ty, z)
      tile_wx, tile_wy = project(tn, tw)
      
      paste_ix = int(round((image_wx - tile_wx) * max_pixels / 2))
      paste_iy = int(round((tile_wy - image_wy) * max_pixels / 2))
      
      tile_im = Image.new('RGBA', (TILE_SIZE, TILE_SIZE))
      tile_im.paste(orig_im, (paste_ix, paste_iy), orig_im)
      tile_im.save(format.replace('%f', os.path.basename(sys.argv[1]))
                         .replace('%z', str(z))
                         .replace('%x', str(tx))
                         .replace('%y', str(ty)))


if __name__ == '__main__':
  main()
