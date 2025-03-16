import Phaser from 'phaser';

import { checkInternetConnection, waitForInternetConnection } from './Utils.js';

class BaseScene extends Phaser.Scene {

  static questionSceneRef = null;

  static playSceneRef = null;

  static notificationBannerSceneRef = null;

  static levelText = null;

  static notificationText = null;

  static notificationBanner = null;

  static levelQuestions = {};

  static qAndAData = [];

  static selectedQandA = [];

  static currentStageNumber = 1;

  static currentGameLevel = 0;

  static stageNumberCheckPoint = [8, 13];

  static maxGameLevel = 15;

  static fontFamilyStyle = null;

  //Audio

  static blockEndMoveAudio = null;

  static backgroundAudio = null;

  static correctAnswerAudio = null;

  static wrongAnswerAudio = null;

  constructor(key) {

    super(key);

  }

  create() {

    BaseScene.windowWidth = this.scale.width;
    BaseScene.windowHeight = this.scale.height;

    BaseScene.fontFamilyStyle = 'GT Walsheim Pro, Sans-Serif, Times New Roman';

    this.setAudio();

  }

  setAudio(){

    BaseScene.backgroundAudio = this.sound.add('backgroundAudio');

    BaseScene.backgroundAudio.setLoop(true);

    BaseScene.blockEndMoveAudio = this.sound.add('blockEndMoveAudio');

    BaseScene.correctAnswerAudio = this.sound.add('correctAnswerAudio');

    BaseScene.wrongAnswerAudio = this.sound.add('wrongAnswerAudio');

    const playOnce = () => {
      this.playBackgroundAudio('backgroundAudio');
      if (BaseScene.backgroundAudio.isPlaying){
        this.input.off('pointerdown', playOnce); 
      }
      
    };
  
    this.input.on('pointerdown', playOnce);

  }

  displayLevelText(boardBound){

    const fontSize = boardBound.top * .7;

    const positionY = boardBound.top / 2;
    const positionX = boardBound.centerX;

    BaseScene.levelText = this.add.text(positionX, positionY, "Level: "  + BaseScene.currentGameLevel, {
      fontFamily: BaseScene.fontFamilyStyle,
      fontSize: fontSize,
      fill: '#000',
      fontStyle: 'bold'
    });

    BaseScene.levelText.setOrigin(.5);

  }

  checkInternetConnectionBanner = async () => {

    if (!await checkInternetConnection()) {

      BaseScene.notificationBannerSceneRef.displayBanner(true, "Kindly check your internet connection");

      await waitForInternetConnection();

      BaseScene.notificationBannerSceneRef.displayBanner();

    }

  }

  //reference

  setPlaySceneRef(reference){
    BaseScene.playSceneRef = reference;
  }

  setQuestionSceneRef(reference){
    BaseScene.questionSceneRef = reference;
  }

  setNotificationBannerSceneRef(reference){
    BaseScene.notificationBannerSceneRef = reference;
  }

  increaseCurrentStageNumber(){
    BaseScene.currentStageNumber += 1;
  }

  resetCurrentStageNumber(){
    BaseScene.currentStageNumber = 1;
  }

  updateLevelInfoData(isNextStageNumber){

    if (BaseScene.currentGameLevel > 1) {

      BaseScene.questionSceneRef.incrementQAndLevelMultiplier();

      if (!BaseScene.levelData.randomizeQuestions
        && isNextStageNumber){

        this.increaseCurrentStageNumber();

        BaseScene.questionSceneRef.resetQAndALevelMultiplier();

      }

    } else if (BaseScene.currentStageNumber > 1){
      
      this.resetCurrentStageNumber();

    }

  }

  updateGameLevelText(){
    BaseScene.levelText.text = `Level: ${BaseScene.currentGameLevel}`;
  }

  setLevelQuestions(qAndA = this.getLevelQuestions()){
    BaseScene.levelQuestions = qAndA;
  }

  getLevelQuestions(targetLevel = BaseScene.currentStageNumber){

    return BaseScene.levelData.randomizeQuestions 
      ? BaseScene.qAndAData
      : BaseScene.qAndAData[targetLevel - 1];

  }

  totalQuestionsCount(gameLevel = BaseScene.currentGameLevel){

    let maxQuestions = 4

    if (gameLevel >= 8 && gameLevel <= 12) {
      maxQuestions = 5;
    } else if (gameLevel >= 13 && gameLevel <= 15) {
      maxQuestions = 7;
    }

    return maxQuestions;

  }

  isNextStageNumber(gameLevel = BaseScene.currentGameLevel){
    return BaseScene.stageNumberCheckPoint.includes(gameLevel);
  }

  getRandomQuestionIndex(gameLevel = BaseScene.currentGameLevel){

    const stageNumberCheckPoint = BaseScene.stageNumberCheckPoint; 

    const targetLevel = gameLevel < stageNumberCheckPoint[0]
      ? gameLevel - 1
      : stageNumberCheckPoint[0] - 1;

    let answeredQuestionCount =  this.totalQuestionsCount(targetLevel) * targetLevel;

    const index = stageNumberCheckPoint.findIndex(value => value < gameLevel);

    if (index >= 0){

        const curStageNumberValue = stageNumberCheckPoint[index];

        const curStageQuestionCount = this.totalQuestionsCount(curStageNumberValue);

        const gameLevelAndStageNumberDifference = gameLevel - curStageNumberValue;

        const gameLevelAndStageNumberQuestionTotalCount = gameLevelAndStageNumberDifference * curStageQuestionCount;

        answeredQuestionCount += gameLevelAndStageNumberQuestionTotalCount;

        if (index > 0) {

          const prevStageNumberValue = stageNumberCheckPoint[index - 1];

          const inBetweenStageNumberDifference = curStageNumberValue - prevStageNumberValue;

          const prevStageQuestionCount = this.totalQuestionsCount(prevStageNumberValue);

          const inBetweenStageQuestionTotalCount = prevStageQuestionCount * inBetweenStageNumberDifference;

          const gameLevelAndStageNumberDifference = gameLevel - curStageNumberValue;

          const gameLevelAndStageNumberQuestionTotalCount = gameLevelAndStageNumberDifference * curStageQuestionCount;

          answeredQuestionCount += inBetweenStageQuestionTotalCount;

          answeredQuestionCount += gameLevelAndStageNumberQuestionTotalCount;

        }
      }

      return answeredQuestionCount;

  }

  playBackgroundAudio(key) {
    console.log("key", key);
    console.log("this.cache.audio.has(key): ", this.cache.audio.has(key));
    console.log("BaseScene.backgroundAudio: ", BaseScene.backgroundAudio);
    console.log("BaseScene.backgroundAudio.isPlaying: ", BaseScene.backgroundAudio.isPlaying);

    if (
      this.cache.audio.has(key) &&
      BaseScene.backgroundAudio &&
      !BaseScene.backgroundAudio.isPlaying
    ) {
      BaseScene.backgroundAudio.play();
    }
  
  }

  //Server
  addSelectedQandA(questionId, selectedQuestionChoiceId){

    BaseScene.selectedQandA.push({
      questionId,
      selectedQuestionChoiceId,
    });

  }

  setServerData(data){
    BaseScene.serverData = data;
  }

  setLevelData(){
    BaseScene.levelData = BaseScene.serverData.categories[0];
  }

  setQandAData = async() => {

    const sortedQuestionById = BaseScene.levelData.questions.slice().sort((a, b) => a.id - b.id);

    if(!BaseScene.levelData.randomizeQuestions){

      sortedQuestionById.forEach(item => {

        const stageIndex = item.stageNumber - 1; // Use stageNumber as index (0-based)
       
        if (!BaseScene.qAndAData[stageIndex]) {
          BaseScene.qAndAData[stageIndex] = [];
        }
  
        BaseScene.qAndAData[stageIndex].push(item);
  
      });

      //load initial q & a images
      await this.loadImageArray(this.getLevelQuestions(), { sync: true });

      //load remaining q & a images
      this.loadImagesAsynchronously();

    } else {

      BaseScene.qAndAData = sortedQuestionById;

      this.setLevelQuestions(BaseScene.qAndAData);

      this.setRandomNumArray(BaseScene.qAndAData.length);

      const targetArrayPercentage = 0.2;
      const targetFirstArrayIndex = Math.ceil(this.randomNumArray.length * targetArrayPercentage);

      //gets q&a array slice for synchronous image loading
      const targetFirstArray = this.randomNumArray
        .slice(0, targetFirstArrayIndex)
        .map(index => BaseScene.qAndAData[index]);

      //gets q&a array slice for asynchronous image loading
      const targetSecondArray = this.randomNumArray
        .slice(targetFirstArrayIndex)
        .map(index => BaseScene.qAndAData[index]);

      //load initial q & a images
      await this.loadImageArray(targetFirstArray, { sync: true });

      //load remaining q & a  images
      this.loadImageArray(targetSecondArray);    

    }

  }


}

export default BaseScene;