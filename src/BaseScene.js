import Phaser from 'phaser';

import { checkInternetConnection, waitForInternetConnection } from './Utils.js';

import { shuffleArray } from './GameHelpers.js';

import backgroundImg from './assets/background.svg';

class BaseScene extends Phaser.Scene {

  static questionSceneRef = null;

  static playSceneRef = null;

  static notificationBannerSceneRef = null;

  static bgImage = null;

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

  static isGamePreview = false;

  static fullScreenIcon = null;

  static loading_container = null;

  static loadingBarsArr = [];

  //Audio

  static blockEndMoveAudio = null;

  static backgroundAudio = null;

  static correctAnswerAudio = null;

  static wrongAnswerAudio = null;

  static startBarIndex  = 0;

  constructor(key) {
    super(key);
  }

  create() {

    BaseScene.windowWidth = this.scale.width;
    BaseScene.windowHeight = this.scale.height;

    this.setBackgroundImg();

    BaseScene.fontFamilyStyle = 'GT Walsheim Pro, Sans-Serif, Times New Roman';

    this.setFullScreenIcon();

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

  setBackgroundImg(){

    BaseScene.bgImage = this.add.image(0, 0, 'backgroundImg')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

    BaseScene.bgImage.visible = false;

  }

  displayLevelText(boardBound){

    const fontSize = boardBound.top * .7;

    const positionY = boardBound.top / 2;
    const positionX = boardBound.centerX;

    BaseScene.levelText = this.add.text(positionX, positionY, "Level: "  + BaseScene.currentGameLevel, {
      fontFamily: BaseScene.fontFamilyStyle,
      fontSize: fontSize,
      fill: "#FFFFFF", // Black text
      stroke: "#000000", // White outline
      strokeThickness: 5,
    });

    BaseScene.levelText.setOrigin(.5);

  }

  setFullScreenIcon(){

    const displayFullScreenIcon = () => {

      BaseScene.fullScreenIcon = this.add
        .image(0, 0, 'enterFullScreenIcon')
        .setOrigin(.5, 1)
        .setInteractive();

      const fullScreenIconScaleXAndY = BaseScene.windowWidth * .05 / BaseScene.fullScreenIcon.width;
      BaseScene.fullScreenIcon.setScale(fullScreenIconScaleXAndY, fullScreenIconScaleXAndY);

    };

    const toggleFullScreen = () => {

      if (this.scale.isFullscreen) {

        document.body.style.background = `url(${backgroundImg}) no-repeat center center / cover`;
      
        BaseScene.bgImage.visible = false;

        this.scale.stopFullscreen();

      } else {
        
        document.body.style.background = 'none';
      
        BaseScene.bgImage.visible = true;

        this.scale.startFullscreen();

      }

    };

    const changeFullScreenIcon = () => {
      BaseScene.fullScreenIcon.setTexture(
        this.scale.isFullscreen ? "exitFullScreenIcon" : "enterFullScreenIcon"
      );
    }
    
    const setupFullScreenHandlers = () => {

      BaseScene.fullScreenIcon.on('pointerdown', toggleFullScreen);

      document.addEventListener("fullscreenchange", changeFullScreenIcon);   

    };
    
    displayFullScreenIcon();
    setupFullScreenHandlers();

  }

  setFullScreenIconPosition(xPosition, yPosition){
    BaseScene.fullScreenIcon.x = xPosition;
    BaseScene.fullScreenIcon.y = yPosition;
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

      if (isNextStageNumber){

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

  playBackgroundAudio(key) {

    if (
      this.cache.audio.has(key) &&
      BaseScene.backgroundAudio &&
      !BaseScene.backgroundAudio.isPlaying
    ) {
      BaseScene.backgroundAudio.play();
    }

  }

  //Loading Files
  setLoadingBarGfx(){

    const setLoadingContainerGfx = () => {

      const containerPosX = BaseScene.windowWidth / 2;
      const containerPosY = BaseScene.windowHeight / 2;

      const containerWidth = BaseScene.windowWidth * .195
      const containerHeight = BaseScene.windowHeight * .05;
      
      BaseScene.loading_container = this.add
        .image(containerPosX, containerPosY, 'loading_container')
        .setOrigin(.5)
        .setDisplaySize(containerWidth, containerHeight)
        .setDepth(1);

    }

    const setContainerBarGfx = () => {

      const containerBorderPercentX = 0.013;
      const containerPaddingPercentX = 0.007;
      const containerBorderPercentY = 0.065;
      const containerPaddingPercentY = 0.065;

      const barCount = 10;
      const paddingCountX = 11;
      
      //y
      const totalBorderAndPaddingPercentY = (containerBorderPercentY + containerPaddingPercentY) * 2;
      const borderAndPaddingSpaceY = BaseScene.loading_container.displayHeight * totalBorderAndPaddingPercentY ;

      //x
      const totalPaddingPercentX = containerPaddingPercentX * paddingCountX;
      const totalBorderPercentX = containerBorderPercentX * 2;

      const totalPaddingSpaceX = BaseScene.loading_container.displayWidth * totalPaddingPercentX;
      const totalBorderX = BaseScene.loading_container.displayWidth * totalBorderPercentX;
      const borderAndPaddingSpace = totalPaddingSpaceX + totalBorderX;

      const availableBarsWidth = BaseScene.loading_container.displayWidth - borderAndPaddingSpace;

      const barBorderSpaceX = BaseScene.loading_container.displayWidth * containerBorderPercentX;
      const barPaddingSpaceX = BaseScene.loading_container.displayWidth * containerPaddingPercentX;

      let positionX = BaseScene.loading_container.getBounds().left + barBorderSpaceX + barPaddingSpaceX;

      const barHeight = BaseScene.loading_container.displayHeight - borderAndPaddingSpaceY;
      const barWidth = availableBarsWidth / barCount;

      for (let i = 0; i < barCount; i++) {

        const positionY = BaseScene.loading_container.y;

        const barType = (i > 0 && i < barCount - 1) ? "center_bar" : "edge_bar";

        const loadingBar = this.add
          .image(positionX, positionY, barType)
          .setOrigin(0, .5)
          .setDisplaySize(barWidth, barHeight)
          .setDepth(1)
          .setVisible(false);

        positionX = loadingBar.displayWidth + loadingBar.x + barPaddingSpaceX;

        if (i === barCount - 1){
          loadingBar.setFlipX(true);
        }

        BaseScene.loadingBarsArr.push(loadingBar);

      }

    }

    setLoadingContainerGfx();
    setContainerBarGfx();

  }

  updateLoadingBars(filesLoadedCount, totalFiles) {

    const barsArr = BaseScene.loadingBarsArr;

    const totalBarsCount = barsArr.length - 1;

    const targetBarIndex = Math.floor((filesLoadedCount / totalFiles) * totalBarsCount);

    for (let i = BaseScene.startBarIndex; i <= targetBarIndex; i++) {

      const currentBar = barsArr[i];

      if (currentBar && !currentBar.visible) {
        currentBar.setVisible(true);
      }
      
    }

    if (filesLoadedCount === totalFiles){
      this.setLoadingBarVisibility();
    }

    BaseScene.startBarIndex = targetBarIndex + 1;

  }

  setLoadingBarVisibility(){

    this.tweens.add({
      targets: [BaseScene.loading_container, ...BaseScene.loadingBarsArr],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        BaseScene.loading_container.setVisible(false);
        BaseScene.loadingBarsArr.forEach(bar => bar.setVisible(false));
      },
    });

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

    const { qAndAData, levelData, currentStageNumber } = BaseScene;

    //separate by stage number
    levelData.questions.forEach(item => {
      const stageIndex = item.stageNumber - 1;
      qAndAData[stageIndex] ??= [];
      qAndAData[stageIndex].push(item);
    });

    //sort or random question
    if (!levelData.randomizeQuestions) {
      qAndAData.forEach(stage => stage.sort((a, b) => a.orderNumber - b.orderNumber));
    } else {
      qAndAData.forEach(shuffleArray);
    }

    const currentStageIndex = currentStageNumber - 1;
    const currentQandAData = qAndAData[currentStageIndex] || [];
    const remainingStageLevelData = qAndAData.slice(currentStageIndex + 1).flat();

    //check if initial question is greater than 1
    if (currentQandAData.length > this.totalQuestionsCount(1)) {
      const targetArrayPercentage = 0.2;
      const targetFirstArrayIndex = Math.ceil(currentQandAData.length * targetArrayPercentage);

      const [targetFirstArray, targetSecondArray] = [
        currentQandAData.slice(0, targetFirstArrayIndex),
        currentQandAData.slice(targetFirstArrayIndex)
      ];

      const firstImagePaths = await BaseScene.questionSceneRef.getImagePathsAndRenderExpressions(targetFirstArray);
      const remainingImagePaths = await BaseScene.questionSceneRef.getImagePathsAndRenderExpressions(
        [...targetSecondArray, ...remainingStageLevelData]
      );

      await this.loadImageArray(firstImagePaths, { sync: true });
      this.loadImageArray(remainingImagePaths);
    } else {

      const firstImagePaths = await BaseScene.questionSceneRef.getImagePathsAndRenderExpressions(currentQandAData);
      const remainingImagePaths = await BaseScene.questionSceneRef.getImagePathsAndRenderExpressions(remainingStageLevelData);

      await this.loadImageArray(firstImagePaths, { sync: true });
      this.loadImageArray(remainingImagePaths);
    }

  }

}

export default BaseScene;