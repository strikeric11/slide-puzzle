import Phaser from 'phaser';
import PlayScene from './PlayScene';
import PreloadScene from './PreloadScene';
import QuestionScene from './QuestionScene';
import NotificationBannerScene from './NotificationBannerScene';

import backgroundImage from './assets/backgroundtest.svg';

// Apply the background image to the body
document.body.style.background = `url(${backgroundImage}) no-repeat center center / cover`;

const Scenes = [
  PreloadScene, 
  PlayScene, 
  QuestionScene, 
  NotificationBannerScene
];

const createScene = Scene => new Scene()

const initScenes = () => Scenes.map(createScene)

const { screen, innerWidth, innerHeight, devicePixelRatio: dpr } = window;
const width = dpr === 1 ? screen.width : innerWidth * dpr;
const height = dpr === 1 ? screen.height : innerHeight * dpr;

const config = {
  type: Phaser.CANVAS,
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container', 
    width: width,
    height: height
  },
  physics: {
    default: 'arcade'
  },
  scene: initScenes()
};

new Phaser.Game(config);
