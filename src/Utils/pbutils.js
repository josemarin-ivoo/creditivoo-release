/* eslint-disable prettier/prettier */
export const getSalesProgressData = (startTime, endTime, currentTime) => {
  var startTime = new Date(startTime); //new Date(2020, 12, 31, 0, 0 , 0);
  var endTime = new Date(endTime); // new Date(2021, 1, 1, 23, 59, 59);
  var currentTime = new Date(currentTime);

  let totalSeconds = Math.round(
    (endTime.getTime() - startTime.getTime()) / 1000,
  );
  let elapsSeconds = 0;

  if (currentTime < startTime) {
    elapsSeconds = 0;
  } else if (currentTime > endTime) {
    // Check is sale period is over
    elapsSeconds = totalSeconds;
  } else {
    // Sales period is going on
    elapsSeconds = Math.round(
      (currentTime.getTime() - startTime.getTime()) / 1000,
    );
  }

  // console.log("totalSeconds: " + totalSeconds + ", elapsSeconds: " + elapsSeconds);
  const progessValue = Math.round((elapsSeconds * 100) / totalSeconds) / 100;
  const remainingValue = convertToHMS(totalSeconds - elapsSeconds);
  return {progressValue: progessValue, remainingValue: remainingValue};
};

export const convertToHMS = (seconds) => {
  var H = Math.floor(seconds / (60 * 60));

  seconds -= H * 60 * 60;
  var M = Math.floor(seconds / 60);

  seconds -= M * 60;
  seconds = Math.floor(seconds);

  return (
    (H < 10 ? '0' : '') +
    H +
    ' : ' +
    (M < 10 ? '0' : '') +
    M +
    ' : ' +
    (seconds < 10 ? '0' : '') +
    seconds
  );
};

export const getSystemDate = () => {
  var d = new Date();
  return new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    0,
  );
};
