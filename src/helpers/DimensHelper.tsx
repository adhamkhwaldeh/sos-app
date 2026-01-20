import {isTablet} from 'react-native-device-info';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';

export default class DimensHelper {
  static marginSmSm = RFPercentage(0.25);
  static marginSm = RFPercentage(0.5);
  static marginXSm = RFPercentage(0.75);
  static marginMd = RFPercentage(1.0);
  static marginXMd = RFPercentage(1.5);
  static marginLg = RFPercentage(2.0);
  static marginXLg = RFPercentage(3.5);

  static paddingSmSm = RFPercentage(0.25);
  static paddingSm = RFPercentage(0.5);
  static paddingXSm = RFPercentage(0.75);
  static paddingMd = RFPercentage(1.0);
  static paddingXMd = RFPercentage(1.5);
  static paddingLg = RFPercentage(2.0);
  static paddingXLg = RFPercentage(3.5);
  static paddingXXLg = RFPercentage(4.0);


  static radiusSmSm = RFPercentage(0.25);
  static radiusSm = RFPercentage(0.5);
  static radiusXSm = RFPercentage(0.75);
  static radiusMd = RFPercentage(1.0);
  static radiusXMd = RFPercentage(1.5);
  static radiusLg = RFPercentage(2.0);
  static radiusXLg = RFPercentage(3.5);
  static radiusXXLg = RFPercentage(4.0);

  static textInputHorizontalPadding = DimensHelper.marginXMd;
  static textInputVerticalPadding = DimensHelper.marginXSm;

  // static marginSmSm = 2;
  // static marginSm = 4;
  // static marginXSm = 6;
  // static marginMd = 8;
  // static marginXMd = 12;
  // static marginLg = 16;

  // static paddingSmSm = 2;
  // static paddingSm = 4;
  // static paddingXSm = 6;
  // static paddingMd = 8;
  // static paddingXMd = 12;
  // static paddingLg = 16;
  // static paddingXLg = 24;
  // static paddingXXLg = 32;

  static marginHoriontal = '2%';

  static iconSizeSmSm = RFPercentage(3.5);

  static iconSizeSm = RFPercentage(5.0);

  static iconSize = RFPercentage(10.0);

  static textInputHeightMd = isTablet() ? RFValue(40.0) : RFValue(50.0);

  static buttonHeightMd = isTablet() ? RFValue(36.0) : RFValue(50.0);


  static fontNormal = RFValue(12.0);

  static fontMedium = RFValue(14.0);

  static fontTitle = RFValue(18.0);

  static imageSizeSM = RFValue(35.0);

  static imageSizeMD = RFValue(50.0);

  static imageSizeLG = RFValue(60.0);
}
