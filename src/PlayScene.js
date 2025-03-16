import BaseScene from './BaseScene';

import blockManager from './BlockManager.js';

import { sizeBasedOnHeightResolutionProportion, toTwoDecimalPlace, scaleBasedOnImage, positionBasedOnResolution } from './Utils.js';

class PlayScene extends BaseScene{

  constructor(){

    super('PlayScene');

    this.xBorderPaddingByPercent = .043;

    this.yBorderPaddingByPercent = .043;

    this.xBorderPaddingByLength = 0;

    this.yBorderPaddingByLength = 0;

    this.blockBorder = .005;

    this.boardBounds = 0;

    this.columnPositions = [];

    this.rowPositions = [];

    this.answeredBlockCellsIndexArr = [];

    this.previousBoardExitIndex = 0;

    this.blockManager = null;

    this.blocksGroup = null;

    this.boardBlockExit = null;

  }

  create() {

    super.create();

    this.setPlaySceneRef(this);

    this.initializeGenerateRandomBlocks();

    this.board = this.add
      .image(0, BaseScene.windowHeight / 2, 'board')
      .setOrigin(.5);

    sizeBasedOnHeightResolutionProportion(this.board, .9); 

    const boardPosition = positionBasedOnResolution(.5, .515);

    this.board.setPosition(boardPosition.xPosition, boardPosition.yPosition); 

    this.boardBounds = this.board.getBounds();

    this.xBorderPaddingByLength = this.getMarginLength(this.boardBounds.width, this.xBorderPaddingByPercent);

    this.yBorderPaddingByLength = this.getMarginLength(this.boardBounds.height, this.yBorderPaddingByPercent);

    const bothYBorderPaddingByLength = this.yBorderPaddingByLength * 2;

    const bothXBorderPaddingByLength = this.xBorderPaddingByLength * 2;

    this.columnPositions =  this.columnPosition(bothXBorderPaddingByLength);

    this.rowPositions = this.rowPosition(bothYBorderPaddingByLength);

    this.smallBlockLengthHor = this.blockSize(3, bothXBorderPaddingByLength, this.boardBounds.width);

    this.smallBlockHeightHor = this.blockSize(6, bothYBorderPaddingByLength, this.boardBounds.height);

    this.smallBlockHeightVer = this.blockSize(3, bothYBorderPaddingByLength, this.boardBounds.height);

    this.bigBlockLengthHor = this.blockSize(2, bothXBorderPaddingByLength, this.boardBounds.width);

    this.bigBlockLengthVer = this.blockSize(2, bothYBorderPaddingByLength, this.boardBounds.height);  

    this.scene.launch('QuestionScene');

    this.blocksGroup = this.physics.add.group();

    this.physics.add.collider(this.blocksGroup, this.blocksGroup);

    this.displayLevelText(this.boardBounds);

  }

  getMarginLength(bounds, marginPercent){

    const totalMarginWidth = bounds * marginPercent;

    return totalMarginWidth;

  }

  createBlockExitGraphics(){

    const generateBlockExitGraphics = () => {

      const exitColor = 0x2B1B0E;

      const blocksInbetweenSpace = this.boardBounds.height * this.blockBorder;

      const boardFrameWidthLength = this.boardBounds.width * (this.xBorderPaddingByPercent - .003);

      const boardFrameHeight = (this.boardBounds.height * this.smallBlockHeightHor) + blocksInbetweenSpace;

      const boardExitPosY = this.rowPositions[this.blockManager.mainBlockLastPosition.rowIndex] - blocksInbetweenSpace;

      const boardExitPosX = this.boardBounds.right - boardFrameWidthLength;

      this.boardBlockExit = this.add.graphics();

      this.boardBlockExit.fillStyle(exitColor, 0.95);

      this.boardBlockExit.fillRect(boardExitPosX, boardExitPosY, boardFrameWidthLength, boardFrameHeight);

      this.previousBoardExitIndex = this.blockManager.mainBlockLastPosition.rowIndex;

    };

    if (this.previousBoardExitIndex !== this.blockManager.mainBlockLastPosition.rowIndex){

      if (this.boardBlockExit !== null){

        this.boardBlockExit.destroy();

        this.boardBlockExit = null;

      }

      generateBlockExitGraphics();

    }

    
  }

  startGameLevel() {

    if (this.blocksGroup.getLength()){

      this.blocksGroup.clear(true, true);      

    }

    BaseScene.currentGameLevel = (BaseScene.currentGameLevel % BaseScene.maxGameLevel) + 1;

    this.updateLevelInfoData(this.isNextStageNumber());

    if (!BaseScene.levelData.randomizeQuestions){

      this.setLevelQuestions();

    }

    this.updateGameLevelText();
    
    this.blockManager.main(this.totalQuestionsCount());

    this.createBlockExitGraphics();

    this.generateBlocks(null, "main_block"); // generate main blocks

    this.generateBlocks(this.blockManager.fillerBlocksArr);

    this.generateBlocks(this.blockManager.blockPositionsArr);

  }

  generateBlocks = (blocksInfo, blockName) => {

    let block = null;

    if (blocksInfo !== null){

      blocksInfo.forEach((value) => {

        let columnIndex = value.columnIndex;

        let rowIndex = value.rowIndex;

        if(value.offSet === -1 && !value.markRows){

          columnIndex = value.columnIndex - (value.blockLength - 1);

        } else if(value.offSet === -1 && value.markRows){

          rowIndex = value.rowIndex - (value.blockLength - 1);

        }

        const blockType = value.markRows ? "vertical_block" : "horizontal_block";

        block = this.blocksGroup.create(
          this.columnPositions[columnIndex],
          this.rowPositions[rowIndex],
          blockType
        );

        if (value.hasOwnProperty("blockValues")){

          value.IsAnswered = false;

          block.setInteractive().setOrigin(0, 0);


        } else {

          block.setInteractive({ draggable: true }).setOrigin(0, 0);

        }

        value.hasCollidedWithOtherBlock = false;

        value.minY = 0;

        value.maxY = 0;

        value.minX = 0;

        value.maxX = 0;

        value.isMainBlock = false;

        value.dragInitialPosition = {x: 0, y: 0};  

        this.blockMovement(block, value.markRows); //block movement

        this.blockClickEventHandler(block); //block question

        if (value.markRows){

          if (value.blockLength === 3){
          
            scaleBasedOnImage(this.board.getBounds(), block, this.smallBlockHeightHor, this.bigBlockLengthVer);

          } else{

            scaleBasedOnImage(this.board.getBounds(), block, this.smallBlockHeightHor, this.smallBlockHeightVer);

          }

          value.defaultMinY = this.boardBounds.top + this.xBorderPaddingByLength;

          value.defaultMaxY = this.boardBounds.bottom - block.displayHeight - this.yBorderPaddingByLength;


        } else {

            if (value.blockLength === 3){
            
              scaleBasedOnImage(this.board.getBounds(), block, this.bigBlockLengthHor, toTwoDecimalPlace(this.smallBlockHeightHor));
  
            } else {
  
              scaleBasedOnImage(this.board.getBounds(), block, this.smallBlockLengthHor, toTwoDecimalPlace(this.smallBlockHeightHor));
  
            }

            value.defaultMinX = this.boardBounds.left + this.xBorderPaddingByLength;

            value.defaultMaxX = this.boardBounds.right - block.displayWidth - this.xBorderPaddingByLength;

        }

        block.blockInfo = value;

      });

    }else {

      let mainBlockInfo = {};

      block = this.blocksGroup.create(
        this.columnPositions[this.blockManager.mainBlockLastPosition.columnIndex[0]],
        this.rowPositions[this.blockManager.mainBlockLastPosition.rowIndex],
        blockName
      );

      block.setInteractive({ draggable: true }).setOrigin(0, 0);

      mainBlockInfo.hasCollidedWithOtherBlock = false;

      mainBlockInfo.minY = 0;

      mainBlockInfo.maxY = 0;

      mainBlockInfo.minX = 0;

      mainBlockInfo.maxX = 0;

      mainBlockInfo.isMainBlock = true;

      mainBlockInfo.defaultMinX = this.boardBounds.left + this.xBorderPaddingByLength;
 
      mainBlockInfo.defaultMaxX = this.boardBounds.right;

      mainBlockInfo.dragInitialPosition = {x: 0, y: 0};

      block.blockInfo = mainBlockInfo;

      this.blockMovement(block, false); 

      this.blockClickEventHandler(block);

      scaleBasedOnImage(this.board.getBounds(), block, this.smallBlockLengthHor, toTwoDecimalPlace(this.smallBlockHeightHor));

    }

    return block

  } 

  blockMovement = (block, ismarkRows) => {

    if (ismarkRows){

      //vertical

      block.on('drag', (pointer, dragX, dragY) => {

        let minY = !block.blockInfo.hasCollidedWithOtherBlock
          ? block.blockInfo.defaultMinY
          : block.blockInfo.minY;

        let maxY = !block.blockInfo.hasCollidedWithOtherBlock
          ? block.blockInfo.defaultMaxY
          : block.blockInfo.maxY;

        if (

          pointer.x >= block.x &&
          pointer.x <= block.x + block.width &&
          pointer.y >= block.y &&
          pointer.y <= block.y + block.height
          
        ) {

          this.physics.overlap(block, this.blocksGroup, (block, overlappingBlock) => {

            if (overlappingBlock.getCenter().y > block.blockInfo.dragInitialPosition.y){

              block.blockInfo.maxY = overlappingBlock.getTopCenter().y - block.displayHeight;

            } else {

              block.blockInfo.minY = overlappingBlock.getBottomCenter().y;

            }

            block.blockInfo.hasCollidedWithOtherBlock = true;

          });

          block.y = Phaser.Math.Clamp(dragY, minY, maxY);

        }

      });
    
      block.on('dragend', () => {

        this.blocksGroup.getChildren().forEach((otherBlock) => {

          if (otherBlock !== block) {

            if (Phaser.Geom.Intersects.RectangleToRectangle(block.getBounds(), otherBlock.getBounds())) {

              if (otherBlock.getCenter().y > block.blockInfo.dragInitialPosition.y){
                block.y = otherBlock.getTopCenter().y - block.displayHeight;
              } else {
                block.y = otherBlock.getBottomCenter().y;
              }
    
              return false;

            }

          }

        });

        let nearestCheckpoint = this.rowPositions[0];

        let closestDistance = Math.abs(block.y - nearestCheckpoint);

        for (let i = 1; i < this.rowPositions.length; i++) {

          let distance = Math.abs(block.y - this.rowPositions[i]);

          if (distance < closestDistance) {

            closestDistance = distance;

            nearestCheckpoint = this.rowPositions[i];

          } 
          
        }

        block.y = nearestCheckpoint;  

        block.blockInfo.hasCollidedWithOtherBlock = false;

        if (block.y !== block.blockInfo.dragInitialPosition.y){
          BaseScene.blockEndMoveAudio.play();
        }

      });

    } else {

        block.on('drag', (pointer, dragX, dragY) => {

          let minX = !block.blockInfo.hasCollidedWithOtherBlock
            ? block.blockInfo.defaultMinX
            : block.blockInfo.minX;

          let maxX = !block.blockInfo.hasCollidedWithOtherBlock
            ? block.blockInfo.defaultMaxX
            : block.blockInfo.maxX;

          if (
            pointer.x >= block.x &&
            pointer.x <= block.x + block.width &&
            pointer.y >= block.y &&
            pointer.y <= block.y + block.height
          ) {

            this.physics.overlap(block, this.blocksGroup, (block, overlappingBlock) => {

              if (overlappingBlock.getCenter().x > block.blockInfo.dragInitialPosition.x){

                block.blockInfo.maxX = overlappingBlock.getTopLeft().x - block.displayWidth;

              } else {

                block.blockInfo.minX  =  overlappingBlock.getTopRight().x;

              }

              block.blockInfo.hasCollidedWithOtherBlock = true;

            });

            block.x = Phaser.Math.Clamp(dragX, minX, maxX);

          } 

        });

        block.on('dragend', async() => {

          this.blocksGroup.getChildren().forEach((otherBlock) => {

            if (otherBlock !== block) {

              if (Phaser.Geom.Intersects.RectangleToRectangle(block.getBounds(), otherBlock.getBounds())) {
                
                if (otherBlock.getCenter().x > block.blockInfo.dragInitialPosition.x){

                  block.x = otherBlock.getTopLeft().x - block.displayWidth;

                } else {

                  block.x = otherBlock.getTopRight().x;

                }

                return false;

              }

            }

          });

          let nearestCheckpoint = this.columnPositions[0];

          let closestDistance = Math.abs(block.x - nearestCheckpoint);

          for (let i = 1; i < this.columnPositions.length; i++) {

            let distance = Math.abs(block.x - this.columnPositions[i]);

            if (distance < closestDistance) {

              closestDistance = distance;

              nearestCheckpoint = this.columnPositions[i];

            } 

          }

          block.x = nearestCheckpoint;  

          block.blockInfo.hasCollidedWithOtherBlock = false;

          if (block.blockInfo.isMainBlock
            && block.x + block.displayWidth > this.boardBounds.right){
          
              this.startGameLevel();

              await this.fadeOutAndInCamera(2000);
          }       
        
          if (block.x !== block.blockInfo.dragInitialPosition.x){
            BaseScene.blockEndMoveAudio.play();
          }

        });
    }

  }

  blockClickEventHandler = (block) => {
    
    block.on('pointerdown', () => {

      block.blockInfo.dragInitialPosition.x = block.x;
      block.blockInfo.dragInitialPosition.y = block.y;

      if (block.blockInfo.hasOwnProperty('blockValues')){
        this.isEndBlock(block);
      } 

    });

  }

  isEndBlock = async(block) => {

    const blockKey = block.blockInfo.blockValues;

    const keyValue = this.blockManager.blockObstructionKeyAndValueObj[blockKey];

    const obstructionCellIndexExist = keyValue.some(keyValueData =>
      this.answeredBlockCellsIndexArr.some(answeredBlockData => this.blockManager.arraysAreEqual(keyValueData, answeredBlockData))
    );

    if (!keyValue.length && !block.blockInfo.IsAnswered
      || obstructionCellIndexExist && !block.blockInfo.IsAnswered){

        this.currentSelectedBlockWithKey = block;

        this.setPlaySceneInputEnabled(false);

        await BaseScene.questionSceneRef.displayBanner(blockKey, (result) => {

          if (result){
    
            const cellIndex = [
              this.currentSelectedBlockWithKey.blockInfo.rowIndex, 
              !this.currentSelectedBlockWithKey.blockInfo.hasOwnProperty("baseColumnIndex") 
                ? this.currentSelectedBlockWithKey.blockInfo.columnIndex 
                : this.currentSelectedBlockWithKey.blockInfo.baseColumnIndex
            ];

            this.currentSelectedBlockWithKey.blockInfo.IsAnswered = true;

            this.answeredBlockCellsIndexArr.push(cellIndex);

            this.input.setDraggable(block, true);

          }

          this.setPlaySceneInputEnabled(true);

        });

      }

  }
  
  initializeGenerateRandomBlocks = () => {

    this.blockManager = new blockManager();

  }

  columnPosition(totalMarginWidth){

    let results = [];

    const numDivisions = this.blockManager.columnCount;

    const blockWidth = (this.boardBounds.width - totalMarginWidth) / numDivisions;

    for (let i = 0; i <= numDivisions; i++) {

      const additionalValue = blockWidth * i;

      const pos = this.boardBounds.left + (this.xBorderPaddingByLength + additionalValue);

      results.push(pos);

    }

    return results;

  }

  rowPosition(totalMarginHeight){

    let results = [];

    const numDivisions = this.blockManager.rowCount;

    const blockWidth = (this.boardBounds.height - totalMarginHeight) / numDivisions;

    for (let i = 0; i <= numDivisions; i++) {

      const additionalValue = blockWidth * i;

      const pos = this.boardBounds.top + (this.yBorderPaddingByLength + additionalValue);

      results.push(pos)

    }

    return results;

  }

  blockSize(numDivisions, marginLength, bounds){

    const blockBorder = bounds * this.blockBorder;

    const blockWidth = (bounds - marginLength - blockBorder) / numDivisions;

    return blockWidth / bounds;

  }

  bigBlockLength(){

    const numDivisions = 2;

    const marginFraction = 2 * this.xBorderPaddingByPercent;

    const totalMarginWidth = this.boardBounds.width * (marginFraction + blockIndividualTotalSpace);

    const blockWidth = (this.boardBounds.width - totalMarginWidth) / numDivisions;

    return blockWidth;

  }

  setPlaySceneInputEnabled(enabled) {

    this.input.enabled = enabled;
  
  }

  fadeOutAndInCamera = (duration) => {
    return new Promise((resolve) => {
      this.cameras.main.fadeOut(duration, 0, 0, 0, () => {
        this.cameras.main.fadeIn(duration, 0, 0, 0, () => {
          resolve();
        });
      });
    });
  };

}

export default PlayScene;