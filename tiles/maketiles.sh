#!/bin/bash
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

# anchor a latitude/longitude to a given point on each image
ANCHOR_LAT_LON=37.78384397669414,-122.40389853715897
ANCHOR_IMG_PT=0.58278,0.00647

mkdir -p out/

echo Making 16 and 17
python gmaps-tiler.py "levels-png/16.png" 16 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/%z_%x_%y.png
python gmaps-tiler.py "levels-png/17.png" 17 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/%z_%x_%y.png

#echo Making L1 \(18, 19, and 20\)
#python gmaps-tiler.py "levels-png/L1_18.png" 18 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L1_%z_%x_%y.png
#python gmaps-tiler.py "levels-png/L1_19.png" 19 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L1_%z_%x_%y.png
#python gmaps-tiler.py "levels-png/L1_20.png" 20 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L1_%z_%x_%y.png

echo Making L2 \(18, 19, and 20\)
python gmaps-tiler.py "levels-png/L2_18.png" 18 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L2_%z_%x_%y.png
python gmaps-tiler.py "levels-png/L2_19.png" 19 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L2_%z_%x_%y.png
python gmaps-tiler.py "levels-png/L2_20.png" 20 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L2_%z_%x_%y.png
#python gmaps-tiler.py "levels-png/L2_21.png" 21 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L2_%z_%x_%y.png

#echo Making L3 \(18, 19, and 20\)
#python gmaps-tiler.py "levels-png/L3_18.png" 18 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L3_%z_%x_%y.png
#python gmaps-tiler.py "levels-png/L3_19.png" 19 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L3_%z_%x_%y.png
#python gmaps-tiler.py "levels-png/L3_20.png" 20 $ANCHOR_LAT_LON $ANCHOR_IMG_PT out/L3_%z_%x_%y.png