import { getRandomWholeNumber } from './Common.js';

import { blockKeyArray } from './GameInternalData.js';

export default class BlockManager {

  constructor () {

    //this.blockValuesArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

    this.blockValuesArr = blockKeyArray();

    this.gridArr = [];

    this.blockPositionsArr = [];

    this.emptyCell2DPositionsArr = [];

    this.availableColumnIndexObstructionArr = []; // index of column that obstruct mainBlock

    this.movedCellPositionsArr = [];

    this.fillerBlocksArr = [];

    this.blockValueAndMoveCellObj = {};

    this.blockObstructionKeyAndValueObj = {};

    this.currentBlockValue = 0;

    this.mainBlockValue = "X";

    this.nextBlockPositionValue = "Y";

    this.lastBlockMoveCellValue = "U";

    this.obstructCellMove = "Z";

    this.emptyCellValue = "O";

    this.commonBlockLength = [2, 3];

    this.blockType = ["vertical", "horizontal"];

    this.longBlockLengthCount = 0;

    this.maxLongBlockLengthCount = 2;

    this.maxBlocksToManipulateCount = 4;

    this.separateBlockPercent = 70; // how many percent to create a new block

    this.mainBlockLastPosition = {
      rowIndex: 0,
      columnIndex: []
    }

    this.rowCount = 6;

    this.columnCount = 6;

    this.mainBlockMinRowIndex = 2; // Minimum row index this.main block can be positioned

    this.mainBlockMaxRowIndex = this.rowCount - 3; // Maximum row index this.main block can be positioned

  }

  resetData = () => {

    this.gridArr = [];

    this.blockPositionsArr = [];

    this.emptyCell2DPositionsArr = [];

    this.availableColumnIndexObstructionArr = []; // index of column that obstruct mainBlock

    this.movedCellPositionsArr = [];

    this.fillerBlocksArr = [];

    this.blockValueAndMoveCellObj = {};

    this.blockObstructionKeyAndValueObj = {};

    this.currentBlockValue = 0;

  }

  convertArrayTo2DPositions = () => {

    for (let i = 0; i < this.rowCount; i++) {

      const row = [];

      for (let j = 0; j < this.columnCount; j++) {

        this.emptyCell2DPositionsArr.push([i, j]);

      }

    }

  }

  removeElementFromArray = (array, elementToRemove) => {

    let index = array.findIndex(item => item[0] === elementToRemove[0] && item[1] === elementToRemove[1]);

    if (index !== -1) {

      array.splice(index, 1);

    }

  }

  getBlockLength = () => {

    let blockLength = this.commonBlockLength[0];

    if (this.longBlockLengthCount < this.maxLongBlockLengthCount){

      blockLength = this.commonBlockLength[getRandomWholeNumber(0, this.commonBlockLength.length)];

    }

    return blockLength;

  }

  arraysAreEqual = (arr1, arr2) => {

    if (arr1.length !== arr2.length) {

      return false;

    }

    for (let i = 0; i < arr1.length; i++) {

      if (arr1[i] !== arr2[i]) {

        return false;

      }
    }

    return true;

  }

  compareArraysOfArrays = (arr1, arr2) => {

    if (arr1.length !== arr2.length) {

      return false;

    }
    for (let i = 0; i < arr1.length; i++) {

      if (!this.arraysAreEqual(arr1[i], arr2[i])) {

        return false;

      }
    }

    return true;
  }

  convert2DPositionToBlockPosition = (arr) => {

    let fillerBlocks = [];

    let rowIndex = 0;

    let columnIndex = 0;

    for (let i = 0; i < arr.length; i++) {

      const data = arr[i];

      let markRows = data[0][0] === data[1][0] ? false : true

      rowIndex = data[0][0];

      columnIndex = data[0][1];

      fillerBlocks.push({
        rowIndex,
        columnIndex,
        offSet: 1,
        blockLength: 2,
        markRows
      })

    }

    return fillerBlocks;

  }
  

  getBlockBranches = () => {

    for (let i = 1; i < this.blockPositionsArr.length; i++) {

      const blocksPositionData = this.blockPositionsArr[i];

      this.blockObstructionKeyAndValueObj[blocksPositionData.blockValues] = [];

      const blockPositionColumnIndex = !blocksPositionData.hasOwnProperty('baseColumnIndex') 
        ? blocksPositionData.columnIndex 
        : blocksPositionData.baseColumnIndex;

      const blocksPositionCellIndex = [blocksPositionData.rowIndex, blockPositionColumnIndex];

      const blocksPositionKeyIndex = blocksPositionData.blockValueIndex;

      const targetKey = this.blockValuesArr[blocksPositionKeyIndex - 1];

      const targetKeyExist = this.blockValueAndMoveCellObj.hasOwnProperty(targetKey);

      if (targetKeyExist) {

        const keysValue = this.blockValueAndMoveCellObj[targetKey];

        let hasDuplicate = false;

        for (let i = 0; i < keysValue.length; i++) {

          if(this.arraysAreEqual(blocksPositionCellIndex, keysValue[i])){

            hasDuplicate = true;

            break;

          } 

        }

        if (hasDuplicate){

          this.blockObstructionKeyAndValueObj[targetKey] = [blocksPositionCellIndex];

        }else {

          hasDuplicate = false;

          let blockValueKey = "";

          let moveCell = [];

          outerLoop: for (const key in this.blockValueAndMoveCellObj) { 

            blockValueKey = key;

            const moveCellArr = this.blockValueAndMoveCellObj[key];      

            for (let i = 0; i < moveCellArr.length; i++) {

              moveCell = moveCellArr[i];

              if(this.arraysAreEqual(blocksPositionCellIndex, moveCell)){

                hasDuplicate = true;

                break outerLoop;

              } 

            }

          }

          if (hasDuplicate){

            if (this.blockObstructionKeyAndValueObj.hasOwnProperty(blockValueKey)){
              
              this.blockObstructionKeyAndValueObj[blockValueKey].push(moveCell);

            }
      
          }else{

            this.blockObstructionKeyAndValueObj[targetKey] = [];

          }

          hasDuplicate = false;

        }

      } 

    }

  }

  storeBlockValueAndMoveCell = (key, cellIndexes) => {

    const keyExists = this.blockValueAndMoveCellObj.hasOwnProperty(key);

    if (keyExists) {

      const previousValue = this.blockValueAndMoveCellObj[key];

      this.blockValueAndMoveCellObj[key] =  previousValue.concat(cellIndexes);

    } else {

      this.blockValueAndMoveCellObj[key] = cellIndexes;

    }

  }

  initialize2DArray = () => {

    this.gridArr = Array.from({ length: this.rowCount }, () => Array(this.columnCount).fill(this.emptyCellValue));

  }

  generateMainBlock = () => {

    const rowIndex = getRandomWholeNumber(this.mainBlockMinRowIndex, this.mainBlockMaxRowIndex + 1);

    const colIndex = getRandomWholeNumber(0, this.columnCount - 4);

    this.mainBlockLastPosition.rowIndex = rowIndex;

    this.mainBlockLastPosition.columnIndex[0] = colIndex;

    this.mainBlockLastPosition.columnIndex[1] = colIndex + 1;

    this.gridArr[rowIndex][this.mainBlockLastPosition.columnIndex[0]] = this.mainBlockValue;

    this.gridArr[rowIndex][this.mainBlockLastPosition.columnIndex[1]] = this.mainBlockValue;

    this.removeElementFromArray(this.emptyCell2DPositionsArr, [rowIndex, this.mainBlockLastPosition.columnIndex[0]]);

    this.removeElementFromArray(this.emptyCell2DPositionsArr, [rowIndex, this.mainBlockLastPosition.columnIndex[1]]);

  }


  mainBlockObstruction = () => {

    const blockLength = this.commonBlockLength[1];

    this.longBlockLengthCount += 1;

    const rowTopSpace =  this.mainBlockLastPosition.rowIndex + 1

    const minRowIndex = rowTopSpace - blockLength; // get minimum row index based on blockLength

    const maxRowIndex = this.mainBlockLastPosition.rowIndex + blockLength; // get maximum row index based on blockLength

    const rowIndex = getRandomWholeNumber(minRowIndex, maxRowIndex);

    const offSet = rowIndex > this.mainBlockLastPosition.rowIndex ? -1 : 1;

    const columnIndex = getRandomWholeNumber(this.mainBlockLastPosition.columnIndex[1] + 1, this.rowCount); // get random column index

    this.markBlockCells(rowIndex, columnIndex, blockLength, offSet, true);

    return {blockLength, rowIndex, columnIndex}

  }

  checkRowSpace2 = (blockLength, randomIndex, mainBlockRowIndex) => {

    let result = []

    const startBlock = randomIndex > mainBlockRowIndex
      ? randomIndex - (blockLength - 1)
      : randomIndex;

    const lastBlock = randomIndex > mainBlockRowIndex
      ? randomIndex
      : randomIndex + (blockLength - 1);

    const BotOccupiedCell = lastBlock - mainBlockRowIndex; //how many cell is occupied by obstruction block from this.main block index to max row count

    const TopOccupiedCell = mainBlockRowIndex - startBlock; //how many cell is occupied by obstruction block from this.main block index to row index 0

    const needTopSpace = blockLength - TopOccupiedCell; //check top space count for the obstruction block to free this.main block

    const needBotSpace = blockLength - BotOccupiedCell; //check bot space count for the obstruction block to free this.main block

    const availableBotSpace = this.columnCount - lastBlock - 1

    const availableTopSpace = startBlock;

    if (availableBotSpace >= needBotSpace){

      const startBlockPos = lastBlock + 1;

      const endBlockPos = lastBlock + needBotSpace

      result.push({startBlockPos, endBlockPos});

    } 

    if (availableTopSpace >= needTopSpace){

      const startBlockPos = startBlock - needTopSpace;

      const endBlockPos = startBlock - 1;

      result.push({startBlockPos, endBlockPos});
    }

    return result;

  }

  checkRowSpace = (rowIndex, columnIndex) => {

    const countSpaces = (direction) => {

      let spaceCount = 0;

      let i = rowIndex + direction;

      while (i >= 0 && i < this.columnCount && (this.gridArr[i][columnIndex] === this.emptyCellValue)) {

        spaceCount++;
        
        i += direction;
        
      }

      return spaceCount;

    };

    const topSpaceCount = countSpaces(-1);

    const bottomSpaceCount = countSpaces(1);

    return {topSpaceCount, bottomSpaceCount}

  };

  checkColumnSpace = (rowIndex, columnIndex) => {

    const countSpaces = (direction) => {

      let spaceCount = 0;

      let i = columnIndex + direction;

      while (i >= 0 && i < this.columnCount && (this.gridArr[rowIndex][i] === this.emptyCellValue)) {

        spaceCount++;

        i += direction;

      }

      return spaceCount;

    };

    const leftSpaceCount = countSpaces(-1);

    const rightSpaceCount = countSpaces(1);

    return {leftSpaceCount, rightSpaceCount}

  };

  getRootIndex = (dataArr, rowIndex, columnIndex) => {

    return dataArr.filter(element => element.rowIndex === rowIndex 
      && element.columnIndex === columnIndex);

  }

  checkOccupiedCellCount = (randomIndex, columnIndex, blockLength, offSet) => {

    let leftOccupiedCell = 0;

    let rightOccupiedCell = 0;

    if (randomIndex < columnIndex){

      leftOccupiedCell = columnIndex - randomIndex;

      rightOccupiedCell = blockLength - leftOccupiedCell - 1;

    } else if (randomIndex > columnIndex){

      rightOccupiedCell = randomIndex - columnIndex;

      leftOccupiedCell = blockLength - rightOccupiedCell - 1;

      
    } else if (randomIndex === columnIndex){

      leftOccupiedCell = offSet === -1 ? blockLength - 1 : 0;

      rightOccupiedCell = offSet === 1 ? blockLength - 1 : 0;

    }

    const needLeftSpace = blockLength - leftOccupiedCell;

    const needRightSPace = blockLength - rightOccupiedCell;

    return {leftOccupiedCell, rightOccupiedCell, needLeftSpace, needRightSPace}

  }

  getLeftMovedCellPosition = (columnIndex, leftOccupiedCell, needLeftSpace) => {

    const startBlockPos = columnIndex - leftOccupiedCell - needLeftSpace;
    
    const endBlockPos = columnIndex - leftOccupiedCell - 1;

    return {startBlockPos, endBlockPos, rootColumnIndex : columnIndex}

  }

  getRightMovedCellPosition = (columnIndex, rightOccupiedCell, needRightSPace) => {

    const startBlockPos = columnIndex + rightOccupiedCell + 1;
    
    const endBlockPos = columnIndex + rightOccupiedCell + needRightSPace;

    return {startBlockPos, endBlockPos, rootColumnIndex : columnIndex}
    
  }

  getAvailableObstructionColumnIndex = () => {

    for (let i = this.mainBlockLastPosition.columnIndex[1] + 1; i < this.columnCount; i++){

      if (this.gridArr[this.mainBlockLastPosition.rowIndex][i] === this.emptyCellValue){

        this.availableColumnIndexObstructionArr.push([this.mainBlockLastPosition.rowIndex, i]);

      }
    }

  }

  createRow = (targetRowIndex, columnIndex) =>{

    let result = [];

    const {leftSpaceCount, rightSpaceCount} = this.checkColumnSpace(targetRowIndex, columnIndex);

    const blockLength = this.getBlockLength();

    const rightAvailableSpace = blockLength - 1 >= rightSpaceCount ? rightSpaceCount : blockLength - 1
    
    const minColumnIndex = leftSpaceCount - (blockLength - 1); // get minimum column index based on blockLength

    const maxColumnIndex = columnIndex + rightAvailableSpace;

    const difference = maxColumnIndex - minColumnIndex;

    let randomIndex = (blockLength <= difference) ? getRandomWholeNumber(minColumnIndex, maxColumnIndex + 1) : columnIndex;

    const offSet = randomIndex >= columnIndex ? -1 : 1;

    let { leftOccupiedCell, rightOccupiedCell, needLeftSpace, needRightSPace } = this.checkOccupiedCellCount(randomIndex, columnIndex, blockLength, offSet);

    const canMoveLeft = leftSpaceCount >= leftOccupiedCell + needLeftSpace;

    const canMoveRight = rightSpaceCount >= rightOccupiedCell + needRightSPace;
  
    //check if block can move either left or right
    if (canMoveLeft && canMoveRight){
      
      let leftEndIndex = 0;

      let rightEndIndex = 0;

      leftEndIndex = offSet < 0 ? randomIndex - (blockLength - 1) : randomIndex;

      rightEndIndex = offSet < 0 ? randomIndex : randomIndex + (blockLength - 1);

      //check if free left space cell is less than commonBlockLength[0]
      //or free right space cell is less than commonBlockLength[0]
      if ((leftEndIndex - 0) < this.commonBlockLength[0]){

        randomIndex += 1;

        ({ leftOccupiedCell, rightOccupiedCell, needLeftSpace, needRightSPace } = this.checkOccupiedCellCount(randomIndex, columnIndex, blockLength, offSet));

      } else if ((this.columnCount - 1) - rightEndIndex < this.commonBlockLength[0] && randomIndex !== this.columnCount - 1){

        randomIndex -= 1;

        ({ leftOccupiedCell, rightOccupiedCell, needLeftSpace, needRightSPace } = this.checkOccupiedCellCount(randomIndex, columnIndex, blockLength, offSet));

      }
    
        result.push(this.getLeftMovedCellPosition(columnIndex, leftOccupiedCell, needLeftSpace));
    
        result.push(this.getRightMovedCellPosition(columnIndex, rightOccupiedCell, needRightSPace));

        

    } else {

      if (canMoveLeft){
    
        result.push(this.getLeftMovedCellPosition(columnIndex, leftOccupiedCell, needLeftSpace));
    
      } else if(canMoveRight){
    
        result.push(this.getRightMovedCellPosition(columnIndex, rightOccupiedCell, needRightSPace));
    
      }

    }

    this.markBlockCells(targetRowIndex, randomIndex, blockLength, offSet, false, columnIndex);

    return result;
  }


  computeBlockAvailableSpaceCount = (arrData) => {

    const results = [];

    let topEmptyCellTotal = 0;

    let bottomEmptyCellTotal = 0;

    arrData.forEach((data) => {

      const rowIndex = data[0];

      const columnIndex =  data[1];

      const rootRowIndex = data.length === 3 ? data[2][0] : null;

      const rootColumnIndex = data.length === 3 ? data[2][1] : null;

      const {topSpaceCount, bottomSpaceCount} = this.checkRowSpace(rowIndex, columnIndex);

      if(topSpaceCount > 0){

        for (let i = rowIndex - 1; i >= rowIndex - topSpaceCount; i--) {

          const {leftSpaceCount, rightSpaceCount} = this.checkColumnSpace(i, columnIndex);

          topEmptyCellTotal += leftSpaceCount + rightSpaceCount;
      
        }

        topEmptyCellTotal += topSpaceCount;

      }

      if(bottomSpaceCount > 0){

        for (let i = rowIndex + 1; i <= rowIndex + bottomSpaceCount; i++) {

          const {leftSpaceCount, rightSpaceCount} = this.checkColumnSpace(i, columnIndex);

          bottomEmptyCellTotal += leftSpaceCount + rightSpaceCount;
    
        }

        bottomEmptyCellTotal += bottomSpaceCount;

      }

      const {leftSpaceCount, rightSpaceCount} = this.checkColumnSpace(rowIndex, columnIndex);

      results.push({  
        rowIndex,
        columnIndex,
        rootRowIndex,
        rootColumnIndex,
        topSpaceCount,
        bottomSpaceCount,
        leftSpaceCount,
        rightSpaceCount,
        topEmptyCellTotal, 
        bottomEmptyCellTotal,
      });

      topEmptyCellTotal = 0;

      bottomEmptyCellTotal = 0;
    
    });
    
    return results;
    
  }


  markColumnMovedCell = (infos, row) => {

    let indexes = [];

    infos.forEach((info) => {

      const difference = info.endBlockPos - info.startBlockPos;

      if (difference > 0 && infos.length >= 1 || difference === 0 && infos.length === 1){

        indexes = this.markCells(row, info.startBlockPos, info.endBlockPos, true, this.nextBlockPositionValue);

      }else{

        const start = (info.startBlockPos < info.rootColumnIndex) ? info.startBlockPos - 1 : info.startBlockPos;
        
        const end = (info.startBlockPos < info.rootColumnIndex) ? info.endBlockPos : info.endBlockPos + 1;

        this.markObstructCells(row, start, end, true, 1);

      }
      
    });

    return indexes;
  }

  markRowMovedCell = (infos, column, cellValue = this.nextBlockPositionValue) => {

    let indexes = [];

    infos.forEach((info) => {

      indexes = this.markCells(column, info.startBlockPos, info.endBlockPos, false, cellValue);

    });

    return indexes;

  }

  markCells = (cell, startBlockPos, endBlockPos, isMarkColumn, cellValue) => {

    let indexes = [];
  
    for (let i = startBlockPos; i <= endBlockPos; i++) {
  
      const currentIndex = isMarkColumn ? [cell, i] : [i, cell];
  
      indexes.push(currentIndex);
  
      this.gridArr[currentIndex[0]][currentIndex[1]] = cellValue;

      this.removeElementFromArray(this.emptyCell2DPositionsArr, currentIndex);
  
    }
  
    return indexes;
  
  }

  markBlockCells = (rowIndex, columnIndex, blockLength, offSet, markRows, baseColumnIndex) => {

    if (markRows) {

      const startBlockPos = offSet === 1 ? rowIndex : rowIndex - (blockLength - 1);

      const endBlockPos = offSet === 1 ? rowIndex + (blockLength - 1) : rowIndex;

      this.markCells(columnIndex, startBlockPos, endBlockPos, false, this.blockValuesArr[this.currentBlockValue]);

    } else {

        const startBlockPos = offSet === 1 ? columnIndex : columnIndex - (blockLength - 1);

        const endBlockPos = offSet === 1 ? columnIndex + (blockLength - 1) : columnIndex;

        this.markCells(rowIndex, startBlockPos, endBlockPos, true, this.blockValuesArr[this.currentBlockValue]);

    }

    this.currentBlockValue += 1;

    const blockValues = this.blockValuesArr[this.currentBlockValue - 1];

    const blockValueIndex = this.currentBlockValue - 1;

    if (typeof baseColumnIndex === 'undefined'){

      this.blockPositionsArr.push({rowIndex, columnIndex, offSet, blockLength, markRows, blockValues, blockValueIndex});

    } else {

      this.blockPositionsArr.push({rowIndex, columnIndex, baseColumnIndex, offSet, blockLength, markRows, blockValues, blockValueIndex});

    }
    
  }

  markObstructCells = (cell, startBlockPos, endBlockPos, isMarkColumn, offSet) => {

    const startPosition = offSet === -1 ? endBlockPos : startBlockPos;

    const endPosition = offSet === -1 ? startBlockPos : endBlockPos;

    this.markCells(cell, startPosition, endPosition, isMarkColumn, this.obstructCellMove);

    this.fillerBlocksArr.push({
      rowIndex : isMarkColumn ? cell : startBlockPos,
      columnIndex : isMarkColumn ? startBlockPos : cell,
      offSet,
      blockLength : 2,
      markRows : !isMarkColumn,
      startPosition,
      endBlockPos,
      type: "Obstruct"
    });

  }

  getColumnIndexBasedOnBlockLength = (arrData) =>{

    const result = [];

    arrData.forEach((data) => {

      const rowIndex = data[0];

      const columnIndex =  data[1];

      const {leftSpaceCount, rightSpaceCount} = this.checkColumnSpace(rowIndex, columnIndex);

      const {topSpaceCount, bottomSpaceCount} = this.checkRowSpace(rowIndex, columnIndex);

      const blockLengths = [this.commonBlockLength[0], this.commonBlockLength[1]];

      for (const length of blockLengths) {

        if (leftSpaceCount >= length) {

          const additionalIndex = columnIndex - length;

          result.push([rowIndex, additionalIndex, [rowIndex, columnIndex]]);

        }

        if (rightSpaceCount >= length) {

          const additionalIndex = columnIndex + length;
          
          result.push([rowIndex, additionalIndex, [rowIndex, columnIndex]]);

        }
      }

      if (topSpaceCount >= this.commonBlockLength[0] 
        || bottomSpaceCount >= this.commonBlockLength[0]
        || leftSpaceCount >= this.commonBlockLength[0] 
        || rightSpaceCount >= this.commonBlockLength[0]){

          result.push([rowIndex, columnIndex]);

      }

    })

    return result;
    
  }

  identifyBlockTypeToGenerate = (arrData, targetArr, isVerticalBlockOnly) => {

    let hasCreatedBlock = true;

    let isAbleToCreateBlock = false;

    let isAfterMainBlockPosition = false;

    let isColumnIndexAlignWIthMainBlock = false;

    let canExtendVerticalBlock = false;

    const blockLength = this.commonBlockLength[0];

    targetArr.blockLength = blockLength;

    if (targetArr.rootRowIndex !== null
      && targetArr.rootRowIndex !== this.mainBlockLastPosition.rowIndex){

        const rootArr = this.getRootIndex(arrData, targetArr.rootRowIndex, targetArr.rootColumnIndex)[0];
  
        const extBlockLength = targetArr.columnIndex > targetArr.rootColumnIndex
          ? targetArr.columnIndex - targetArr.rootColumnIndex
          : targetArr.rootColumnIndex - targetArr.columnIndex;

        const offSet = targetArr.columnIndex > targetArr.rootColumnIndex
          ? 1
          : -1

        this.markBlockCells(targetArr.rootRowIndex, targetArr.rootColumnIndex, extBlockLength, offSet, false);

        targetArr.blockLength = extBlockLength;

        const blocksToManipulateAndCurrentDifference = this.maxBlocksToManipulateCount - this.currentBlockValue;

        if (offSet === -1){
        
          if (rootArr.rightSpaceCount >= extBlockLength){

            const lastCellIndex = rootArr.columnIndex + 2;

            this.markObstructCells(rootArr.rowIndex, rootArr.columnIndex + 1, lastCellIndex, true, 1);

          }

          if(targetArr.leftSpaceCount >= blockLength
            && blocksToManipulateAndCurrentDifference >= 1){

              targetArr.finalColumnIndex = targetArr.columnIndex;

              this.markBlockCells(targetArr.rowIndex, targetArr.columnIndex, blockLength, offSet, false);

          } else {

              targetArr.finalColumnIndex = targetArr.rootColumnIndex;

          }
          
        }else {

          if (rootArr.leftSpaceCount >= extBlockLength){

            const lastCellIndex = rootArr.columnIndex - 2;

            this.markObstructCells(rootArr.rowIndex, rootArr.columnIndex - 1, lastCellIndex, true, -1);

          }

          if(targetArr.rightSpaceCount >= blockLength
            && blocksToManipulateAndCurrentDifference >= 1){

            targetArr.finalColumnIndex = targetArr.columnIndex;

            this.markBlockCells(targetArr.rowIndex, targetArr.columnIndex, blockLength, offSet, false);

          } else {

              targetArr.finalColumnIndex = targetArr.rootColumnIndex;

          }
                
        }

        targetArr.blockType = this.blockType[1]; //horizontal

        targetArr.offSet = offSet;

      } else {

          const horizontalSpaceCount = targetArr.leftSpaceCount + targetArr.rightSpaceCount;

          const verticalSpaceCount = targetArr.topSpaceCount + targetArr.bottomSpaceCount;

          const columnIndex = targetArr.rootRowIndex !== this.mainBlockLastPosition.rowIndex
            ? targetArr.columnIndex
            : targetArr.rootColumnIndex;

          if (horizontalSpaceCount > verticalSpaceCount 
            && targetArr.rootRowIndex !== this.mainBlockLastPosition.rowIndex){

              // create a horizontal block type

              const leftSpaceIsGreater = targetArr.leftSpaceCount >= blockLength && targetArr.leftSpaceCount > targetArr.rightSpaceCount;

              const rightSpaceIsGreater = targetArr.rightSpaceCount >= blockLength;

              targetArr.blockType = this.blockType[1];

              if(leftSpaceIsGreater){

                targetArr.offSet = -1;

                this.markBlockCells(targetArr.rowIndex, targetArr.columnIndex, blockLength, targetArr.offSet, false);

                if (targetArr.rightSpaceCount >= blockLength){

                  const lastCellIndex = targetArr.columnIndex + 2;

                  this.markObstructCells(targetArr.rowIndex, targetArr.columnIndex + 1, lastCellIndex, true, 1);
          
                }
                
              } else if (rightSpaceIsGreater){
                    
                  targetArr.offSet = 1;

                  this.markBlockCells(targetArr.rowIndex, targetArr.columnIndex, blockLength, targetArr.offSet, false);

                  if (targetArr.leftSpaceCount >= blockLength){

                    const lastCellIndex = targetArr.columnIndex - 2;

                    this.markObstructCells(targetArr.rowIndex, targetArr.columnIndex - 1, lastCellIndex, true, -1);

                  }
          
              } else {

                  hasCreatedBlock = false;

              }

          } else{

              //purpose of targetArr.topSpaceCount >= this.commonBlockLength[0] && targetArr.topSpaceCount > this.commonBlockLength[0] 
              //is that it wont create a block if it's available space is not greater than blocklength
              
              //create a vertical block type

              targetArr.blockType = this.blockType[0];

              isColumnIndexAlignWIthMainBlock = this.columnIndexAlignWIthMainBlock(columnIndex);

              const requiredBottomSpace = isColumnIndexAlignWIthMainBlock || isVerticalBlockOnly
                ? targetArr.bottomSpaceCount >= this.commonBlockLength[0] 
                : targetArr.bottomSpaceCount > this.commonBlockLength[0];
            
              const bottomSpaceIsGreater = requiredBottomSpace && targetArr.bottomSpaceCount > targetArr.topSpaceCount;

              const topSpaceIsGreater = isColumnIndexAlignWIthMainBlock  || isVerticalBlockOnly
                ? targetArr.topSpaceCount >= this.commonBlockLength[0] 
                : targetArr.topSpaceCount > this.commonBlockLength[0];

              if (bottomSpaceIsGreater){

                targetArr.offSet = 1;

              } else if (topSpaceIsGreater){
          
                targetArr.offSet = -1;    

              } 

              ({isAbleToCreateBlock, isAfterMainBlockPosition} = this.ableToCreateBlock(targetArr, blockLength));

              if ((bottomSpaceIsGreater || topSpaceIsGreater)
                && isAbleToCreateBlock){

                  this.markBlockCells(targetArr.rowIndex, columnIndex, blockLength, targetArr.offSet, true);

                  //place additional movecell value at lowermost row

                  targetArr.finalColumnIndex = columnIndex;

                  if (bottomSpaceIsGreater && targetArr.topSpaceCount >= blockLength){

                    const lastCellIndex = targetArr.rowIndex - 2;

                    this.markObstructCells(targetArr.columnIndex, targetArr.rowIndex - 1, lastCellIndex, false, -1);

                    canExtendVerticalBlock = true;

                  }else if (topSpaceIsGreater && targetArr.bottomSpaceCount >= blockLength){

                    const lastCellIndex = targetArr.rowIndex + 2;

                    this.markObstructCells(targetArr.columnIndex, targetArr.rowIndex + 1, lastCellIndex, false, 1);

                    canExtendVerticalBlock = true;

                  }

                }else {

                  hasCreatedBlock = false;

                }

          }
    }

    return {hasCreatedBlock, targetArr, isAfterMainBlockPosition, isColumnIndexAlignWIthMainBlock, canExtendVerticalBlock};

  }

  getBestIndex = (arrData) => {

    let highestSum = 0;

    let indexNum = 0;

    let highestEmptyCells = [];

    let targetArr = [];

    const totalAvailableSpaceCount = () => {

      for (const info of arrData) {

        const sum = info.bottomEmptyCellTotal + info.topEmptyCellTotal + info.leftSpaceCount + info.rightSpaceCount;
    
        if (sum > highestSum) {
    
          highestSum = sum;
    
          highestEmptyCells = [info];
    
        } else if (sum === highestSum) {
    
          highestEmptyCells.push(info);
    
        }
        
      } 

    }

    const midmostIndex = () => {

      const rowMidValue = (this.columnCount - 1) / 2;

      let closestColumnIndex = 0;

      let closestDifference = Infinity;

      for (let i = 0; i < highestEmptyCells.length; i++) {

        const difference = Math.abs(highestEmptyCells[i].columnIndex - rowMidValue);
      
        if (difference < closestDifference) {

          indexNum = i;

          closestColumnIndex = highestEmptyCells[i].columnIndex;

          closestDifference = difference;

        }

      }
      
    }

    totalAvailableSpaceCount();

    if (highestEmptyCells.length > 1){

      midmostIndex();

    }

    targetArr = highestEmptyCells[indexNum];

    return {arrData, targetArr};

  }

  getVerticalBoundarySpace = (cellInfo) => {

    let difference = 0;

    if (cellInfo.columnIndex >= this.mainBlockLastPosition.columnIndex[0]){

      if (cellInfo.offSet === -1 && cellInfo.rowIndex < this.mainBlockLastPosition.rowIndex){

        difference = cellInfo.rowIndex - 0;

      }else if (cellInfo.offSet === -1 && cellInfo.rowIndex > this.mainBlockLastPosition.rowIndex){

        difference = (cellInfo.rowIndex - this.mainBlockLastPosition.rowIndex) - 1;

      } else if (cellInfo.offSet === 1 && cellInfo.rowIndex > this.mainBlockLastPosition.rowIndex){

        difference = ((this.rowCount - 1) - cellInfo.rowIndex);

      } else {

        difference = (this.mainBlockLastPosition.rowIndex - cellInfo.rowIndex) - 1;

      }

    }

    return difference;
    
  }

  afterMainBlockPosition = (columnIndex) => {

    return columnIndex >= this.mainBlockLastPosition.columnIndex[0];

  }

  columnIndexAlignWIthMainBlock = (index) =>{

    return index === this.mainBlockLastPosition.columnIndex[0] || index === this.mainBlockLastPosition.columnIndex[1];

  }

  ableToCreateBlock = (cellInfo, blockLength) => {

    let isAbleToCreateBlock = true;

    const isAfterMainBlockPosition = this.afterMainBlockPosition(cellInfo.columnIndex);

    if (isAfterMainBlockPosition){

      const difference = this.getVerticalBoundarySpace(cellInfo);

      const withinBoundary = difference >= blockLength ? true : false;

      let outBoundaryOccupiedCell = 0;

      if (!withinBoundary){

        const inBoundaryOccupiedCell = (blockLength - 1) + difference

        outBoundaryOccupiedCell = cellInfo.offSet === 1
          ? cellInfo.bottomSpaceCount - inBoundaryOccupiedCell
          : cellInfo.topSpaceCount - inBoundaryOccupiedCell;

        isAbleToCreateBlock = outBoundaryOccupiedCell >= blockLength;

      }

    } 
    
    return {isAbleToCreateBlock, isAfterMainBlockPosition};

  }


  //get move cell of block 
  determineMoveCell = (columnInfo, isAfterMainBlockPosition, isColumnIndexAlignWIthMainBlock) => {

    let result = [];
    
    if (columnInfo.blockType === this.blockType[0]){

      const endBlockPos = columnInfo.offSet === -1
        ? columnInfo.rowIndex - columnInfo.blockLength
        : columnInfo.rowIndex + columnInfo.blockLength;

      const startBlockPos = endBlockPos;

      result = this.markRowMovedCell([{startBlockPos, endBlockPos}], columnInfo.finalColumnIndex);

      const difference = this.getVerticalBoundarySpace(columnInfo);

      let endBlockPos2 = 0;

      let startBlockPos2 = 0;

      if (!isColumnIndexAlignWIthMainBlock
        && isAfterMainBlockPosition
        && (difference >= 0 && difference < 2)){

          const startBlockAdditional = difference === 1 ? 1 : columnInfo.blockLength;

          startBlockPos2 = columnInfo.offSet === -1
            ? this.mainBlockLastPosition.rowIndex - columnInfo.blockLength
            : this.mainBlockLastPosition.rowIndex + startBlockAdditional

          if (difference === 1){

            endBlockPos2 = columnInfo.offSet === -1
              ? this.mainBlockLastPosition.rowIndex - 1
              : this.mainBlockLastPosition.rowIndex + columnInfo.blockLength;

          } else {

              endBlockPos2 = startBlockPos2;

          }

          const lastBlockMoveCellIndexes = this.markRowMovedCell([{startBlockPos: startBlockPos2, endBlockPos: endBlockPos2}], columnInfo.columnIndex, this.lastBlockMoveCellValue);

          this.storeBlockValueAndMoveCell(this.blockValuesArr[this.currentBlockValue - 1], lastBlockMoveCellIndexes);

          this.movedCellPositionsArr.push(...lastBlockMoveCellIndexes); //store all cell with this.lastBlockMoveCellValue mark

        }

    } else {

      let startBlockPos = 0;

      let endBlockPos = 0;

      if (columnInfo.rootRowIndex !== null){

        if (columnInfo.columnIndex <  columnInfo.rootColumnIndex && columnInfo.offSet === 1){

          startBlockPos = columnInfo.finalColumnIndex - 1;
    
        } else if (columnInfo.columnIndex <  columnInfo.rootColumnIndex && columnInfo.offSet === -1){
          
            startBlockPos = columnInfo.finalColumnIndex - columnInfo.blockLength;
    
        } else if (columnInfo.columnIndex >  columnInfo.rootColumnIndex && columnInfo.offSet === -1){
          
            startBlockPos = columnInfo.finalColumnIndex + 1;
    
        } else if (columnInfo.columnIndex >  columnInfo.rootColumnIndex && columnInfo.offSet === 1){
            
            startBlockPos = columnInfo.finalColumnIndex + columnInfo.blockLength;
    
        }

      } else {

          if (columnInfo.offSet === 1){

            startBlockPos = columnInfo.columnIndex + columnInfo.blockLength;

          } else {

            startBlockPos = columnInfo.columnIndex - columnInfo.blockLength;
    
          } 

      }

      endBlockPos = startBlockPos;

      result = this.markColumnMovedCell([{startBlockPos, endBlockPos}], columnInfo.rowIndex);

    }

    return result;

  }

  generateSpecialBlocks = (arrData, isVerticalBlockOnly = false) =>{

    let hasCreatedBlock = false;

    let targetArr = {};

    let isAfterMainBlockPosition = false;

    let isColumnIndexAlignWIthMainBlock = false;

    let canExtendVerticalBlock = false;

    let moveCellIndexes = [];

    if (!isVerticalBlockOnly){

      arrData = this.getColumnIndexBasedOnBlockLength(arrData);

    }

    if (arrData.length){

      const finalResults = this.computeBlockAvailableSpaceCount(arrData);

      ({arrData, targetArr} = this.getBestIndex(finalResults));

      ({hasCreatedBlock, targetArr, isAfterMainBlockPosition, isColumnIndexAlignWIthMainBlock, canExtendVerticalBlock} = this.identifyBlockTypeToGenerate(arrData, targetArr, isVerticalBlockOnly));

      if (hasCreatedBlock){

        moveCellIndexes = this.determineMoveCell(targetArr, isAfterMainBlockPosition, isColumnIndexAlignWIthMainBlock);

        if (targetArr.rootRowIndex !== null){

          if (targetArr.finalColumnIndex === targetArr.columnIndex){     

            this.storeBlockValueAndMoveCell(this.blockValuesArr[this.currentBlockValue - 2], [[targetArr.rowIndex, targetArr.columnIndex]]);

            this.storeBlockValueAndMoveCell(this.blockValuesArr[this.currentBlockValue - 1], moveCellIndexes);

          }else{

            this.storeBlockValueAndMoveCell(this.blockValuesArr[this.currentBlockValue - 1], moveCellIndexes);

          }
        }

        else {

          this.storeBlockValueAndMoveCell(this.blockValuesArr[this.currentBlockValue - 1], moveCellIndexes);

        }
    
      } 
      
    } 
    
    return {hasCreatedBlock, moveCellIndexes, targetArr, canExtendVerticalBlock};

  } 

  generateFillerBlocks  = () => {

    const getVerticalFillerBlock = () => {

      let sequentialCells = [];

      for (let x = 0; x < this.emptyCell2DPositionsArr.length; x++) {

        const currentCell = this.emptyCell2DPositionsArr[x];

        let incrementedCurrentCell = [...this.emptyCell2DPositionsArr[x]];

        incrementedCurrentCell[0]++;

        for (let y = x + 1; y < this.emptyCell2DPositionsArr.length; y++) {
      
          const nextCell = this.emptyCell2DPositionsArr[y];

          const isVerticallyAlligned = this.arraysAreEqual(incrementedCurrentCell, nextCell);

          const isAllignedOnMainBlockLastPosition = 
            (currentCell[0] !== this.mainBlockLastPosition.rowIndex ||
             currentCell[1] < this.mainBlockLastPosition.columnIndex[0]) &&
            (nextCell[0] !== this.mainBlockLastPosition.rowIndex ||
             nextCell[1] < this.mainBlockLastPosition.columnIndex[0]);

          if (isVerticallyAlligned && isAllignedOnMainBlockLastPosition){

            sequentialCells.push([currentCell, nextCell]);
            
          } 
           
        }
      
      }

      return sequentialCells;
      
    }

    const getHorizontalBlock = () => {

      let sequentialCells = [];

      for (let i = 0; i < this.emptyCell2DPositionsArr.length - 1; i++) {

        const currentCell = this.emptyCell2DPositionsArr[i];

        let incrementedCurrentCell = [...this.emptyCell2DPositionsArr[i]];

        incrementedCurrentCell[1]++;

        const nextCell = this.emptyCell2DPositionsArr[i + 1];

        const isHorizontallyAlligned = this.arraysAreEqual(incrementedCurrentCell, nextCell);

        const isAllignedOnMainBlockLastPosition = (currentCell[0] !== this.mainBlockLastPosition.rowIndex);

        if (isHorizontallyAlligned && isAllignedOnMainBlockLastPosition){

          sequentialCells.push([currentCell, nextCell]);

        }

      }

      return sequentialCells;

    }

    const removeRandomDuplicate = (arr1, arr2, blocksToGenerate) => {

      let uniqueElements = [];

      let combinedArray = arr1.concat(arr2);

      while (combinedArray.length
        && uniqueElements.length < blocksToGenerate){

          let isUnique = true;

          const element1 = combinedArray[getRandomWholeNumber(0, combinedArray.length)];

          for (let y = 0; y < uniqueElements.length; y++) {

            let element2 = uniqueElements[y];
    
            if (
    
              this.arraysAreEqual(element1[0], element2[0]) ||
              this.arraysAreEqual(element1[0], element2[1]) ||
              this.arraysAreEqual(element1[1], element2[0]) ||
              this.arraysAreEqual(element1[1], element2[1])
    
            ){

              isUnique = false;

              break;

            } 
      
          }

          if (!isUnique){

            this.removeElementFromArray(combinedArray, element1);

          } else{

            uniqueElements.push(element1);

          }

          isUnique = true;

      }

      this.fillerBlocksArr.push(...this.convert2DPositionToBlockPosition(uniqueElements));

    }
    
    
    

    const percentForFillerBlocks = 40;

    const totalBlocksToGenerate = Math.floor((this.emptyCell2DPositionsArr.length * (percentForFillerBlocks / 100)) / 2);

    const verticalFillerBlock = getVerticalFillerBlock();

    const horizontalFillerBlock = getHorizontalBlock();

    removeRandomDuplicate(verticalFillerBlock, horizontalFillerBlock, totalBlocksToGenerate);

  }
  
  
  main = (numOfBlocks) => {

    if (this.gridArr.length){

      this.resetData();
      
    }

    this.maxBlocksToManipulateCount = numOfBlocks;

    let canExtendVerticalBlock = false;

    let targetArr = {};

    this.convertArrayTo2DPositions();

    this.initialize2DArray(); 

    this.generateMainBlock();

    const { blockLength, rowIndex, columnIndex } = this.mainBlockObstruction(); //create obstruction for Main Block

    const rowInfos = this.checkRowSpace2(blockLength, rowIndex, this.mainBlockLastPosition.rowIndex);

    let moveCellIndexes = this.markRowMovedCell(rowInfos, columnIndex);

    this.movedCellPositionsArr.push(...moveCellIndexes);

    this.storeBlockValueAndMoveCell(this.blockValuesArr[this.currentBlockValue - 1], moveCellIndexes);

    const targetIndex = moveCellIndexes[getRandomWholeNumber(0, moveCellIndexes.length)]; // chosenIndex for creation of row

    this.removeElementFromArray(this.movedCellPositionsArr, targetIndex);

    const createRowResult = this.createRow(targetIndex[0], targetIndex[1]);

    moveCellIndexes = this.markColumnMovedCell(createRowResult, targetIndex[0]);

    this.movedCellPositionsArr.push(...moveCellIndexes);

    this.storeBlockValueAndMoveCell(this.blockValuesArr[this.currentBlockValue - 1], moveCellIndexes)

    const firstBlockSectionCount = Math.floor(this.maxBlocksToManipulateCount * (this.separateBlockPercent / 100));

    let hasCreatedBlock = false;

    let hasTerminatedPrematurely = false;

    for (let i = this.currentBlockValue; i < firstBlockSectionCount; i++){

      let initMoveCellIndex = moveCellIndexes;

      ({hasCreatedBlock, moveCellIndexes, targetArr} = this.generateSpecialBlocks(initMoveCellIndex));

      if (hasCreatedBlock){
        
        if (targetArr.rootRowIndex !== null){

          this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rootRowIndex, targetArr.rootColumnIndex]);

        } else if (targetArr.blockType === this.blockType[0]){

          this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rowIndex, targetArr.finalColumnIndex]);

        } else if (targetArr.blockType === this.blockType[1]){

          this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rowIndex, targetArr.columnIndex]);

        }
 
      } else{

          this.movedCellPositionsArr.push(...initMoveCellIndex);

          hasTerminatedPrematurely = true;

          break;
      }

    }

    if (!hasTerminatedPrematurely){

      this.movedCellPositionsArr.push(...moveCellIndexes);
      
    }

    //create another section of block

    hasCreatedBlock = true;

    let isVerticalBlockOnly = true;

    let isAvailableColumnIndexObstructionClosed = false;

    this.getAvailableObstructionColumnIndex();

    moveCellIndexes = this.availableColumnIndexObstructionArr;

    let previousAvailableIndex = [...this.availableColumnIndexObstructionArr];

    while (this.currentBlockValue < this.maxBlocksToManipulateCount){

      let initMoveCellIndex = moveCellIndexes;

      ({hasCreatedBlock, moveCellIndexes, targetArr, canExtendVerticalBlock} = this.generateSpecialBlocks(initMoveCellIndex, isVerticalBlockOnly));

      if(!hasCreatedBlock 
        || (!canExtendVerticalBlock && isVerticalBlockOnly)){

          if (!isAvailableColumnIndexObstructionClosed){

            this.availableColumnIndexObstructionArr = [];
        
            this.getAvailableObstructionColumnIndex();

            if (this.availableColumnIndexObstructionArr.length
              && !this.compareArraysOfArrays(previousAvailableIndex, this.availableColumnIndexObstructionArr)){
        
              previousAvailableIndex = [...this.availableColumnIndexObstructionArr];

              moveCellIndexes = this.availableColumnIndexObstructionArr;

              isVerticalBlockOnly = true;
        
            }else {
                
              isAvailableColumnIndexObstructionClosed = true;
        
              moveCellIndexes = this.movedCellPositionsArr;

              previousAvailableIndex = [];

              isVerticalBlockOnly = false;
        
            }

          } else {
              
              if (Object.keys(targetArr).length
                && this.movedCellPositionsArr.length) {

                  if (targetArr.rootRowIndex !== null){

                    this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rootRowIndex, targetArr.rootColumnIndex]);
    
                  } else {
    
                    this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rowIndex, targetArr.columnIndex]);
    
                  }

                  moveCellIndexes = this.movedCellPositionsArr;
                
                } else {

                    if (!Object.keys(targetArr).length
                      && !this.compareArraysOfArrays(previousAvailableIndex, this.movedCellPositionsArr)){

                        previousAvailableIndex = [...this.movedCellPositionsArr];

                        moveCellIndexes = this.movedCellPositionsArr;

                      } else {

                          break;

                      }

                }

          }

      } else {

          if (!isAvailableColumnIndexObstructionClosed){

            isVerticalBlockOnly = isVerticalBlockOnly === true ? false : true;

          } 

          if (targetArr.rootRowIndex !== null){

            this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rootRowIndex, targetArr.rootColumnIndex]);

          } else if (targetArr.blockType === this.blockType[0]){

              this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rowIndex, targetArr.finalColumnIndex]);

          } else if (targetArr.blockType === this.blockType[1]){

              this.removeElementFromArray(this.movedCellPositionsArr, [targetArr.rowIndex, targetArr.columnIndex]);

          }

      }

    }

    this.generateFillerBlocks(); //important remove after testing

    this.getBlockBranches();

  }
  
}
