import BaseScene from './BaseScene';

import { blockKeyArray } from './GameInternalData.js';

import { getQuestionImageUrl } from './api/instance.api.js';

class QuestionScene extends BaseScene 
{
  constructor() {

    super('QuestionScene');

    this.banner = null;

    this.checkBoxImgArr = [];

    this.answersTextArr = [];

    this.answersImgArr = [];

    this.chosenQandA = {};

    this.QandAContainer = null;

    this.callbackDisplayBannerReference = null;

    this.questionText = null;

    this.questionImg = null;

    this.bannerBounds = null;

    this.closeBtn = null;

    this.bannerWidth = 0;

    this.bannerHeight = 0;

    this.answerTextIndent = 0.09;

    this.selectedCheckBoxIndex = 0;

    this.submitBtn = null;
    
    this.currentQuestionIndex = 0;

    this.questionTextDefaultFontSize = 0;

    this.answerFontSize = 0;

    this.questionTextWordWrap = 0;

    this.answerTextWordWrap = 0;

    this.questionTextMaxHeightPercent = .315;

    this.questionImgMaxHeightPercent = .26;

    this.questionImgHeightLimit = 0;

    this.answerHeightLimit = 0;

    this.answerWidthLimit = 0;

    this.beforeAndAfterAnswerSpace = 0;

    this.individualAnswerHeight = 0;

    this.answerCount = 4;

    this.qAndLevelMultiplier = 0

    this.blockKeyValues = blockKeyArray();

    this.randomNumArray = [];
    
  }

  async create() {

    this.setQuestionSceneRef(this);

    this.setQandABanner();

    await this.setQandAData();

    setTimeout(() => {
      BaseScene.playSceneRef.startGameLevel();
    }, 700);
    
  }

  setQandABanner(){

    this.QandAContainer = this.add.container(0, 0);

    const setBannerBg = () => {

      const scaleXFactor = .6;

      this.banner = this.add
        .image(0, 0, 'banner')
        .setOrigin(.5, .5);

      const availableSpaceForBanner = BaseScene.windowHeight * .9;

      const bannerScaleY = availableSpaceForBanner / this.banner.height;
      const bannerScaleX = BaseScene.windowWidth * scaleXFactor / this.banner.width;

      this.banner.setScale(bannerScaleX, bannerScaleY);

      this.banner.x = BaseScene.windowWidth / 2;
      this.banner.y = BaseScene.windowHeight / 2;

    }

    const setQandAProperties = () => {

      this.bannerBounds = this.banner.getBounds();

      this.bannerWidth = this.bannerBounds.width;
      this.bannerHeight = this.bannerBounds.height;

      this.questionTextWordWrap = this.bannerWidth * .85;
      this.answerTextWordWrap = this.bannerWidth * .8;
      this.questionTextDefaultFontSize = this.bannerHeight * .07; //question text default font size
      this.textGapSpace = this.bannerHeight * .03;
      this.beforeAndAfterAnswerSpace = this.bannerHeight * .0425;
   
    }

    const setQuestionText = () => {

      this.questionText = this.add.text(0, 0, "", {
        fontFamily: BaseScene.fontFamilyStyle,
        fontSize: this.questionTextDefaultFontSize,
        fill: '#000',
        wordWrap: {
          width: this.questionTextWordWrap,
          useAdvancedWrap: true
        }
      });
  
      this.questionText.setOrigin(0, 0);

      this.questionImg = this.add
        .image(0, 0, 'placeholder')
        .setOrigin(0)
        .setScale(0);

      this.QandAContainer.add(this.questionImg);
      
      this.QandAContainer.add(this.questionText);

    }

    const setAnswerText = () => {

      const fontSizeReductionPercent = .1;

      this.individualAnswerHeight = this.bannerHeight * .105;

      this.answerFontSize = this.questionTextDefaultFontSize - this.questionTextDefaultFontSize * fontSizeReductionPercent;

      for (let i = 0; i < this.answerCount; i++) {

        const answerText = this.add.text(0, 0, "", {
          fontFamily: BaseScene.fontFamilyStyle,
          fontSize: this.answerFontSize,
          fill: '#00000',
          wordWrap: {
            width: this.answerTextWordWrap,
            useAdvancedWrap: true
          }
        });

        const answerImg = this.add
          .image(0, 0, 'placeholder')
          .setOrigin(0)
          .setScale(0);

        this.QandAContainer.add(answerText);  
        this.QandAContainer.add(answerImg);
        this.answersTextArr.push(answerText);
        this.answersImgArr.push(answerImg);

        setAnswerCheckBox(i);

      }

    }

    const setAnswerCheckBox = (index) => {

      const checkbox = this.add
        .image(0, 0, 'uncheck')
        .setOrigin(.5, .5)
        .setInteractive();

      checkbox.isChecked = false;

      checkbox.isWrongAnswer = false;

      checkbox.index = index;

      this.checkBoxEventHandler(checkbox);

      //scale
      const targetScale = this.answerFontSize * .9;

      checkbox.setScale(targetScale / checkbox.displayWidth, targetScale / checkbox.displayHeight);

      //add to arrays
      this.checkBoxImgArr.push(checkbox);

      this.QandAContainer.add(checkbox);

    }

    const setSubmitButton = () => {

      this.submitBtn = this.add
        .image(0, 0, 'button')
        .setOrigin(.5, 0)
        .setInteractive();

      const scaleXFactor = .14;

      const scaleYFactor = .07;

      this.submitBtn.displayWidth = this.bannerWidth * scaleXFactor;

      this.submitBtn.displayHeight = this.bannerHeight * scaleYFactor;

      this.QandAContainer.add(this.submitBtn);

      this.submitButtonEventHandler();

    }

    const setBannerCloseButton = () => {

      const targetSize = this.questionTextDefaultFontSize;

      this.closeBtn = this.add
        .image(0, 0, 'close_btn')
        .setOrigin(0, .5)
        .setInteractive();

      //scale

      const targetScale = targetSize / this.closeBtn.height;
      this.closeBtn.setScale(targetScale, targetScale);

      //position

      const bannerWorldSpaceTopLeft = this.banner.getTopRight();
      this.closeBtn.x = bannerWorldSpaceTopLeft.x;
      this.closeBtn.y = bannerWorldSpaceTopLeft.y;

      this.closeButtonEventHandler(this.closeBtn);

    }

    setBannerBg();

    setQandAProperties();

    setQuestionText();

    setAnswerText();

    setSubmitButton(); 

    setBannerCloseButton();

    this.questionImgHeightLimit = this.bannerHeight * this.questionImgMaxHeightPercent;

    this.answerHeightLimit = this.bannerHeight * .115;
    this.answerWidthLimit = this.bannerWidth * 0.85;

    this.QandAContainer.setDepth(1);

    this.QandAContainer.setVisible(false);

    this.banner.setVisible(false);

    this.closeBtn.setVisible(false);

    this.submitBtn.setVisible(false);

  }

  updateQandATextorImage(){

    let questionElement = null;

    let bannerElementsTotalHeight = 0;

    let afterAndBeforeAnswerSpace = 0;

    const checkBoxPositionX = this.questionText.x + this.bannerWidth * this.answerTextIndent;

    const getTextureProperties = (filename) => {

      const texture = this.textures.get(filename);

      if (texture && texture.source.length > 0) {
        const baseFrame = texture.getSourceImage();
        return { imgWidth: baseFrame.width, imgHeight: baseFrame.height };
      } else {
          console.warn("Texture not found:", filename);
          return null;
      }
    
    }

    const updateQuestion = () => {

      if (this.chosenQandA.textType === "text"){

        if (this.questionImg.scale > 0){
          this.questionImg.setScale(0);
        }

        if (this.questionText.scale === 0){
          this.questionText.setScale(1);
        }

        this.questionText.setText(this.chosenQandA.text);
        this.questionText.setFontSize(this.questionTextDefaultFontSize);

        this.readjustTextBasedOnContainer(
          this.questionText,
          this.questionImgHeightLimit,
          this.questionTextDefaultFontSize,
          this.questionTextWordWrap,
          .05
        )

        questionElement = this.questionText;
  
        bannerElementsTotalHeight += this.questionText.displayHeight;

      } else {

        if (this.questionText.scale > 0){
          this.questionText.setScale(0);
        }

        if (this.questionImg.scale === 0){
          this.questionImg.setScale(1);
        }

        const fileName = this.extractFileName(this.chosenQandA.text);

        const { imgWidth, imgHeight } = getTextureProperties(fileName);

        this.questionImg.setTexture(fileName);

        this.questionImg.setScale(1);

        this.questionImg.displayHeight = Math.min(imgHeight, this.questionImgHeightLimit);
        this.questionImg.displayWidth = Math.min(imgWidth, this.questionTextWordWrap);

        bannerElementsTotalHeight += this.questionImg.displayHeight;

        questionElement = this.questionImg;

      } 
      
    }

    const updateAnswerSize = async() => {

      const answers = this.chosenQandA.choices;

      for (let i = 0; i < answers.length; i++) {

        const imgElement = this.answersImgArr[i];
        const textElement = this.answersTextArr[i];

        const answer = answers[i];

        const answerText = answer.text;

        if (answer.textType === "text"){

          if (textElement.scale === 0){
            textElement.setScale(1);
          }

          if (imgElement.scale > 0){
            imgElement.setScale(0);
          }

          textElement.setText(answerText);
          textElement.setFontSize(this.answerFontSize);
    
          const reductionFactor = .05;
    
          this.readjustTextBasedOnContainer(
            textElement,
            this.answerHeightLimit,
            this.answerFontSize,
            this.answerTextWordWrap,
            reductionFactor
          )
    
          bannerElementsTotalHeight += textElement.displayHeight;

        } else if (this.chosenQandA.choices[i].textType === "image") {
          
          if (imgElement.scale === 0){
            imgElement.setScale(1);
          }

          if (this.answersTextArr[i].scale > 0){
            this.answersTextArr[i].setScale(0);
          }

          const fileName = this.extractFileName(answerText);

          const { imgWidth, imgHeight } = getTextureProperties(fileName);
            
          imgElement.setTexture(fileName);

          imgElement.displayHeight = Math.min(imgHeight, this.answerHeightLimit);
          imgElement.displayWidth = Math.min(imgWidth, this.answerWidthLimit);
          bannerElementsTotalHeight += imgElement.displayHeight;

        } else {

          const textureKey = "expression_" + this.chosenQandA.choices[i].id;

          if(textElement.scale > 0){
            textElement.setScale(0);
          }

          const setImageTexture = () => {
            imgElement.setTexture(textureKey);
            imgElement.setScale(1);
            bannerElementsTotalHeight += this.answerHeightLimit;
          }

          setImageTexture();

        }
  
      }

    }

    const updateAnswerPosition = () => {

      bannerElementsTotalHeight += this.bannerHeight * .07;

      const isShortQandAText = bannerElementsTotalHeight < this.bannerHeight * .7;

      afterAndBeforeAnswerSpace = this.bannerHeight * (isShortQandAText ? 0.045 : 0.034);

      const inBetweenAnswerAndAnswerSpace = this.bannerHeight * (isShortQandAText ? 0.035 : 0.027);

      const answers = this.chosenQandA.choices;

      for (let i = 0; i < answers.length; i++) {

        const answer = answers[i];
        
        const targetElement = answer.textType === "text"
          ? this.answersTextArr[i]
          : this.answersImgArr[i];
      
        targetElement.x = checkBoxPositionX;
      
        if (i === 0) {

          targetElement.y = questionElement.displayHeight + afterAndBeforeAnswerSpace;

        } else {

          const previousElement = answers[i - 1].textType === "text"
            ? this.answersTextArr[i - 1]
            : this.answersImgArr[i - 1];

          const previousElementBotBound = previousElement.y + previousElement.displayHeight;
      
          targetElement.y = previousElementBotBound + inBetweenAnswerAndAnswerSpace;

        }

        updateCheckBoxPosition(i, targetElement);

      }

    }

    const updateCheckBoxPosition = (index, targetElement) => {

      const checkBoxElement = this.checkBoxImgArr[index];
      checkBoxElement.x = (questionElement.x + targetElement.x) / 2;
      checkBoxElement.y = targetElement.y + targetElement.displayHeight / 2;

    }

    const updateSubmitBtnSizeAndPosition = () => {

      this.QandAContainer.remove(this.submitBtn);
      
      const answers = this.chosenQandA.choices;

      const targetElement = answers[3].textType === "text"
        ? this.answersTextArr[this.answersTextArr.length - 1]
        : this.answersImgArr[this.answersImgArr.length - 1];

        
      const submitBtnPosX = this.QandAContainer.getBounds().width / 2;

      const submitBtnPosY = targetElement.y + targetElement.displayHeight 
        + afterAndBeforeAnswerSpace;

      this.QandAContainer.add(this.submitBtn);

      this.submitBtn.x = submitBtnPosX;
    
      this.submitBtn.y = submitBtnPosY;

    }

    const updateQandAContainerPosition = () => {

      const topQuestionBounds = questionElement.getBounds().top;

      const submitBtnBottomBounds = this.submitBtn.getBounds().bottom;

      const actualQandAContainerHeight = submitBtnBottomBounds - topQuestionBounds;

      this.QandAContainer.setPosition(
        this.banner.x - this.QandAContainer.getBounds().width / 2, 
        this.banner.y - actualQandAContainerHeight / 2, 
      );
    }

    updateQuestion();

    updateAnswerSize();

    updateAnswerPosition();

    updateSubmitBtnSizeAndPosition();

    updateQandAContainerPosition();
    
  }

  readjustTextBasedOnContainer(textReference, maxTextHeight, defaultFontSize, wordWrapWidth, reductionFactor){

    let textHeight = textReference.getBounds().height;

    if (textHeight > maxTextHeight){

      while (textReference.getBounds().height > maxTextHeight){

        const textHeight = textReference.getBounds().height;

        const heightDifference = textHeight / maxTextHeight;

        const reductionPercent = heightDifference > 1 ? reductionFactor : .02;

        defaultFontSize -= defaultFontSize * reductionPercent;

        textReference.setFontSize(defaultFontSize);

        textReference.setWordWrapWidth(wordWrapWidth, true);

      }

    }

  }

  updateQandAData(blockKey){

    let qandAIndex = 0;

    const blockKeyValue = this.blockKeyValues.indexOf(blockKey);

    const getCurrentQandAData = () => {
      const { qAndAData, levelData, currentStageNumber } = BaseScene;

      return qAndAData[Math.min(currentStageNumber - 1, levelData.typeStage.totalStageCount - 1)];
    };

    const currentQandAData = getCurrentQandAData();

    const questionsTotalCount = currentQandAData.length;

    const questionMultiplier = this.qAndLevelMultiplier * this.totalQuestionsCount();

    qandAIndex = (questionMultiplier + blockKeyValue) % questionsTotalCount;

    this.chosenQandA = currentQandAData[qandAIndex];

    this.chosenQandA.correctAnswerIndex = this.chosenQandA.choices.findIndex(item => item.isCorrect === true);

  }

  incrementQAndLevelMultiplier(){
    this.qAndLevelMultiplier += 1;
  }

  resetQAndALevelMultiplier(){
    this.qAndLevelMultiplier = 0;
  }

  //Event Handler
  async displayBanner(blockKey, callback){

    this.callbackDisplayBannerReference = (value) => {

      this.checkBoxImgArr.forEach((data) => {
        data.isWrongAnswer = false;
        data.isChecked = false;
        data.setTexture('uncheck');
      });

      this.answersTextArr.forEach((data) => {
        data.setFill('#000');
      });

      callback(value);

    };

    this.QandAContainer.setVisible(true);

    this.banner.setVisible(true);

    this.closeBtn.setVisible(true);

    this.updateQandAData(blockKey);

    this.updateQandATextorImage();

  }

  checkBoxEventHandler(checkbox){

    checkbox.on('pointerdown', () => {

      if (!checkbox.isChecked) {

        if (!this.submitBtn.visible) {
          this.submitBtn.setVisible(true);
        }

        checkbox.isChecked = true;

        checkbox.setTexture('check');

        this.selectedCheckBoxIndex = checkbox.index;

        this.checkBoxImgArr.forEach((data) => {
          if (data.index !== checkbox.index 
            && data.isChecked
            && !data.isWrongAnswer){

            data.isChecked = false;

            data.setTexture('uncheck');

          }
        });

      } 
    });

  }

  closeButtonEventHandler(closeBtn){

    closeBtn.on('pointerdown', () => {

      this.banner.setVisible(false);

      this.closeBtn.setVisible(false);

      this.submitBtn.setVisible(false);

      this.QandAContainer.setVisible(false);

      this.callbackDisplayBannerReference(false);

    });

  }

  submitButtonEventHandler = () =>{
   
    this.submitBtn.on('pointerdown', async () => {

      const { correctAnswerAudio, wrongAnswerAudio } = BaseScene;

      const questionId = this.chosenQandA.id;

      const selectedAnswerId = this.chosenQandA.choices[this.selectedCheckBoxIndex].id;

      if (this.selectedCheckBoxIndex === this.chosenQandA.correctAnswerIndex){

        if(!BaseScene.isGamePreview){
          this.addSelectedQandA(questionId, selectedAnswerId);
        }

        correctAnswerAudio.play();

        this.banner.setVisible(false);

        this.closeBtn.setVisible(false);

        this.QandAContainer.setVisible(false);

        this.submitBtn.setVisible(false);
  
        this.callbackDisplayBannerReference(true);

      } else {

        wrongAnswerAudio.play();

        const targetCheckBox = this.checkBoxImgArr[this.selectedCheckBoxIndex];

        const targetAnswerText = this.answersTextArr[this.selectedCheckBoxIndex];

        targetAnswerText.setFill('#FF0000');

        targetCheckBox.setTexture('incorrect');

        targetCheckBox.isWrongAnswer = true;

      }

    });

  }

  async loadImageArray(imagePathArr, options = { sync: false }, callback) {
    this.load.off('filecomplete', loadImage, this);
    this.load.off('loaderror', errorLoadImage, this);

    let imageIndex = 0;

    if (options.sync) {
      options.promise = new Promise((resolve) => {
        options.resolve = resolve;
      });
    }

    if (imagePathArr.length === 0) {

      if (options.sync) {
        options.resolve(true);
      }
      if (callback) {
        callback();
      }

      return options.sync ? options.promise : undefined;

    } else if (options.sync){
      this.setLoadingBarGfx();
    }

    const loadCurrentFile = () => {
      const filePath = imagePathArr[imageIndex];
      const fileName = this.extractFileName(filePath);
      const fileUrl = getQuestionImageUrl(filePath);

      if (!this.textures.exists(fileName)) {
        this.load.image(fileName, fileUrl);
      } else {
        loadImage();
      }
    };

    const loadImage = (key, type, texture) => {

      imageIndex += 1;

      if(options.sync){
        this.updateLoadingBars(imageIndex, imagePathArr.length);
      }
      
      if (imageIndex < imagePathArr.length) {
        loadCurrentFile();
      } else {
        if (options.sync) {
          options.resolve(true);
        }
        if (callback) {
          callback();
        }
      }
    };

    const errorLoadImage = async (file) => {
      await this.checkInternetConnectionBanner();
      loadCurrentFile();
      this.load.start();
    };

    this.load.on('filecomplete', loadImage, this);

    this.load.on('loaderror', errorLoadImage, this);

    loadCurrentFile();
    this.load.start();

    return options.sync ? options.promise : undefined;
    
  }

  async getImagePathsAndRenderExpressions(qandAData) {

    const imagePathArr = [];

    for (const data of qandAData) {
      if (data.textType === "image") {
        imagePathArr.push(data.text);
      }
      for (const choice of data.choices) {
        if (choice.textType === "image") {
          imagePathArr.push(choice.text);
        } else if (choice.textType === "expression") {
          const svgFile = await this.latexToSvg(choice.text);
  
          if (svgFile) {
            const textureKey = "expression_" + choice.id;
            await this.convertInlineSvgToPhaserTexture(
              svgFile,
              textureKey,
              this.answerTextWordWrap,
              this.answerHeightLimit,
              .75
            );
          }
        }
      }
    }

    return imagePathArr;

  }

  extractFileName(filePath) {
    return filePath.match(/[^/]+$/)[0];
  }

  //Latex Expression
  latexToSvg = async (latex) => {
    try {
      const node = await MathJax.tex2svgPromise(latex, { display: true });
      return node.querySelector("svg");
    } catch (err) {
      return null;
    }
  };

  convertInlineSvgToPhaserTexture(svg, textureKey, containerWidth, containerHeight, scaleFactor = 0.55) {
    const svgString = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      const aspectRatio = originalWidth / originalHeight;

      let targetWidth = containerWidth * scaleFactor;
      let targetHeight = containerHeight * scaleFactor;

      if (targetWidth / targetHeight > aspectRatio) {
          targetWidth = targetHeight * aspectRatio;
      } else {
          targetHeight = targetWidth / aspectRatio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      this.textures.addImage(textureKey, canvas);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }


}

export default QuestionScene;