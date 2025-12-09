export const SKELETON_SPEED = 1500;
export const SKELETON_BG = '#dddddd';
export const SKELETON_HIGHLIGHT = '#e7e7e7';
export const MAX_RATING_DEVIATION = 200;

const {width, height} = Dimensions.get('window');
import React from 'react';
import {View, Dimensions} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {moderateScale} from 'react-native-size-matters';

const TestPage = () => {
  return (
    <SkeletonPlaceholder
      speed={SKELETON_SPEED}
      backgroundColor={SKELETON_BG}
      highlightColor={SKELETON_HIGHLIGHT}>
      <View
        style={{
          flexDirection: 'row',
          marginTop: moderateScale(10),
          justifyContent: 'space-between',
        }}>
        <View style={[style.topView, {height: height * 0.04}]} />
        <View
          style={[
            style.topView,
            {height: height * 0.04, marginRight: moderateScale(16)},
          ]}
        />
      </View>

      <View style={[style.LineView, {width: width / 2}]} />

      <View style={{flexDirection: 'row'}}>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
      </View>

      <View style={{flexDirection: 'row'}}>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
      </View>

      <View style={{flexDirection: 'row'}}>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
      </View>

      <View style={{flexDirection: 'row'}}>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
        <View>
          <View style={[style.imagebox]} />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.015, width: width / 3.5},
            ]}
          />
          <View
            style={[
              style.LineView1,
              {height: height * 0.02, width: width / 3.8},
            ]}
          />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

const style = {
  imagebox: {
    marginTop: moderateScale(25),
    borderWidth: 0,
    elevation: moderateScale(5),
    shadowOpacity: 0.6,
    borderRadius: 16,
    marginRight: moderateScale(8),
    height: 185,
    width: width / 2.25,
    marginLeft: 12,
  },
  topView: {
    width: 35,
    marginTop: moderateScale(8),
    borderWidth: 0,
    elevation: moderateScale(5),
    shadowOpacity: 0.6,
    borderRadius: 13,
    marginLeft: 18,
  },
  skeltonTabView: {
    marginTop: moderateScale(25),
    borderWidth: 0,
    height: 50,
    elevation: moderateScale(5),
    shadowOpacity: 0.6,
    borderRadius: 16,
    marginRight: moderateScale(8),
  },
  LineView: {
    marginTop: moderateScale(12),
    borderWidth: 0,
    height: height * 0.042,
    elevation: moderateScale(5),
    shadowOpacity: 0.6,
    borderRadius: 12,
    marginRight: moderateScale(8),
    marginLeft: 18,
  },
  LineView1: {
    marginTop: moderateScale(5),
    borderWidth: 0,
    elevation: moderateScale(5),
    shadowOpacity: 0.6,
    borderRadius: 12,
    marginRight: moderateScale(8),
    marginLeft: 18,
  },
};

export default TestPage;
