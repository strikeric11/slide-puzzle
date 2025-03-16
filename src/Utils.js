import BaseScene from './BaseScene';

import isOnline from 'is-online'; 

export const scaleBasedOnResolution = (image, xScalePercentage, YScalePercentage) => {

  const xResolution = BaseScene.windowWidth;
  const YResolution = BaseScene.windowHeight;

  const scaleX = xResolution * xScalePercentage / image.width;
  const scaleY = YResolution * YScalePercentage / image.height;

  return image.setScale(scaleX, scaleY);
}

export const sizeBasedOnHeightResolutionProportion = (image, heightPercentage) => {

  const xResolution = BaseScene.windowHeight;

  const spriteHeight = xResolution * heightPercentage;

  image.displayWidth = spriteHeight;

  image.displayHeight = spriteHeight;

  return image;

};

export const scaleBasedOnImage = (parentImgBounds, childImg, xPercent, yPercent) => {

  const scaleX = parentImgBounds.width * xPercent / childImg.width;
  const scaleY = parentImgBounds.height * yPercent / childImg.height;

  return childImg.setScale(scaleX, scaleY);

}

export const positionBasedOnResolution = (xPercentage, yPercentage) => {

  const xResolution = BaseScene.windowWidth;
  const YResolution = BaseScene.windowHeight;

  const xPosition = xResolution * xPercentage;
  const yPosition = YResolution * yPercentage;

  return {xPosition, yPosition}
}

export const calculateQuotient = (dividend, divisor) => {
  return dividend / divisor;
}

export const calculateDifference = (minuend, subtrahend) => {
  return minuend - subtrahend;
}

export const calculateSum = (num1, num2) => {
  return num1 + num2;
}

export const calculateProduct =(multiplicand, multiplier) => {
  return multiplicand * multiplier;
}

export const toPercent = (value) => {

  return value / 100;

}

export const toWholeNumber = (value) => {

  return value * 100;

}

export const toTwoDecimalPlace = (value) => {

  return Math.floor(value * 100) / 100
  
}

export const getTopCoordinate = (obj) => {

  const bounds = obj.getBounds();

  return bounds.top;

}

export const getBottomCoordinate = (obj) => {

  const bounds = obj.getBounds();

  return bounds.bottom + bounds.height;

}

export const leftBotMostXYCoordinate = (obj) => {
  const bounds = obj.getBounds();

  const x = bounds.left;
  const y = bounds.bottom;

  return {x, y};
}

//local space
export const getHeightCoordinateLocalSpace = (obj, percent) => {
  const bounds = obj.getBounds();

  return bounds.top + (bounds.height * percent);
}

//local space
export const getWidthCoordinateLocalSpace = (obj, percent) => {
  const bounds = obj.getBounds();

  return bounds.left + (bounds.width * percent);
}

export const topLeftPercentage = (obj) => {
  const bounds = obj.getBounds();

  const x = bounds.left

  const y = bounds.bottom;

  return {x, y};
}

export const topCenterPercentage = (obj, topPercentage) => {

  const bounds = obj.getBounds();

  const x = (bounds.left + bounds.right) / 2;
  const y = bounds.top + (bounds.height * topPercentage);

  return { x, y };

}

export const checkInternetConnection = async () => {
  return await isOnline();
};

export const waitForInternetConnection = () => {

  return new Promise((resolve) => {

    const intervalId = setInterval(async () => {

      if (await checkInternetConnection()) {

        clearInterval(intervalId);

        resolve(true);

      }

    }, 5000);

  });

};