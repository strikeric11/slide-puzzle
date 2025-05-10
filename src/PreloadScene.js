import { getActivityBySlugAndCurrentStudentUser } from './api/data.api';

import backgroundImg from './assets/background.svg';

//loading
import loading_container from './assets/loading_bar/container.svg';

import center_bar from './assets/loading_bar/center_bar.svg';

import edge_bar from './assets/loading_bar/edge_bar.svg';

//full screen icon

import enterFullScreenIcon from './assets/enter_full_screen_icon.svg';

import exitFullScreenIcon from './assets/exit_full_screen_icon.svg';

import board from './assets/board.svg';

import banner from './assets/banner.svg';

import notificationBanner from './assets/notificationbanner.svg';

import placeholder from './assets/placeholder.svg';

import horizontal_block from './assets/horizontal_block.svg';

import vertical_block from './assets/vertical_block.svg';

import main_block from './assets/main_block2.svg';

import uncheck from './assets/uncheck.png';

import check from './assets/check.png';

import incorrect from './assets/incorrect.png';

import button from './assets/Button.png';

import close_btn from './assets/close_btn.png';

import customFont from './assets/font/body-400.woff2';

//Base Scene

import BaseScene from './BaseScene';

//Audio

import backgroundAudioMP3 from './assets/audio/backgroundAudio.mp3';
import backgroundAudioOGG from './assets/audio/backgroundAudio.ogg';
import backgroundAudioM4A from './assets/audio/backgroundAudio.m4a';

import blockEndMoveAudioMP3 from './assets/audio/blockMoveEndAudio.mp3';
import blockEndMoveAudioOGG from './assets/audio/blockMoveEndAudio.ogg';
import blockEndMoveAudioM4A from './assets/audio/blockMoveEndAudio.m4a';

import correctAnswerAudioMP3 from './assets/audio/correctAnswerAudio.mp3';
import correctAnswerAudioOGG from './assets/audio/correctAnswerAudio.ogg';
import correctAnswerAudioM4A from './assets/audio/correctAnswerAudio.m4a';

import wrongAnswerAudioMP3 from './assets/audio/wrongAnswerAudio.mp3';
import wrongAnswerAudioOGG from './assets/audio/wrongAnswerAudio.ogg';
import wrongAnswerAudioM4A from './assets/audio/wrongAnswerAudio.m4a';



class PreloadScene extends BaseScene{

  constructor(){
    super('PreloadScene');
  }

  preload () {

    //Audio

    this.load.audio('backgroundAudio', [
      backgroundAudioMP3,
      backgroundAudioOGG,
      backgroundAudioM4A
    ]);

    this.load.audio('blockEndMoveAudio', [
      blockEndMoveAudioMP3,
      blockEndMoveAudioOGG,
      blockEndMoveAudioM4A
    ]);

    this.load.audio('correctAnswerAudio', [
      correctAnswerAudioMP3,
      correctAnswerAudioOGG,
      correctAnswerAudioM4A
    ]);

    this.load.audio('wrongAnswerAudio', [
      wrongAnswerAudioMP3,
      wrongAnswerAudioOGG,
      wrongAnswerAudioM4A
    ]);

    //Loading Files
    this.load.svg('loading_container', loading_container);

    this.load.svg('center_bar', center_bar);

    this.load.svg('edge_bar', edge_bar);

    //full screen icon
    this.load.svg('enterFullScreenIcon', enterFullScreenIcon);

    this.load.svg('exitFullScreenIcon', exitFullScreenIcon);

    //Images
    this.load.svg('backgroundImg', backgroundImg);

    this.load.svg('board', board);

    this.load.svg('notificationBanner', notificationBanner);

    this.load.svg('banner', banner);

    this.load.image('uncheck', uncheck);

    this.load.image('button', button);

    this.load.image('close_btn', close_btn);

    this.load.image('check', check);

    this.load.image('incorrect', incorrect);

    this.load.svg('placeholder', placeholder);

    this.load.svg('horizontal_block', horizontal_block);

    this.load.svg('vertical_block', vertical_block);

    this.load.svg('main_block', main_block);

    (async () => {
      await this.loadFont('GT Walsheim Pro', customFont);
    })();

  }

  async create(){

    this.scene.start('NotificationBannerScene');

    await this.waitForBannerSceneReady();

    await this.checkInternetConnectionBanner(); //check and wait for internet connection

    const { activity, isPreview } = await getActivityBySlugAndCurrentStudentUser();

    console.log("activity: ", activity);

    BaseScene.isGamePreview = isPreview;

    this.setServerData(activity);

    this.setLevelData();

    this.scene.start('PlayScene');

  }

  waitForBannerSceneReady = async () => {

    return new Promise((resolve) => {

      const notificationBannerScene = this.scene.get('NotificationBannerScene');

      notificationBannerScene.events.once('bannerSceneReady', () => {
        resolve(); 
      });

    });

  }

  loadFont = async (name, url) => {
    const font = new FontFace(name, `url(${url})`);
    await font.load();
    document.fonts.add(font);
  };

}

export default PreloadScene;