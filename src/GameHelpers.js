
export const randomNumsArray = (numLength) => {

  const randomArrNum = Array.from({ length: numLength }, (_, i) => i);

  for (let i = randomArrNum.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [randomArrNum[i], randomArrNum[randomIndex]] = [randomArrNum[randomIndex], randomArrNum[i]];
  }

  return randomArrNum;
  
};