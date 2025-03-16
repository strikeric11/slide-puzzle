import BaseScene from './BaseScene';

class NotificationBannerScene extends BaseScene{

    constructor() {
  
      super('NotificationBannerScene');

      this.notificationBanner = null;

      this.notificationText = null;
  
    }
  
    create() {

      this.createNotificationBanner();

      this.setNotificationBannerSceneRef(this);

      this.events.emit('bannerSceneReady');

    }

    createNotificationBanner(){

      this.notificationBanner = this.add
        .image(0, 0, 'notificationBanner')
        .setOrigin(.5, .5);
  
      const bannerScaleY =  this.scale.width * .2 / this.notificationBanner.height;
      const bannerScaleX = this.scale.height * .5 / this.notificationBanner.width;
  
      this.notificationBanner.setScale(bannerScaleX, bannerScaleY);
  
      this.notificationBanner.x = this.scale.width / 2;
      this.notificationBanner.y = this.scale.height / 2;

      //Text

      const notificationBannerBounds =  this.notificationBanner.getBounds();

      const notificationTextSize = notificationBannerBounds.height * .065;

      this.notificationText = this.add.text(0, 0, "", {
        fontFamily: BaseScene.fontFamilyStyle,
        fontSize: notificationTextSize,
        fill: '#00000',
        wordWrap: {

          width: notificationBannerBounds.width * .8,

          useAdvancedWrap: true

        }
      });

      this.notificationBanner.setVisible(false);

      this.notificationText.setVisible(false);

    }

    displayBanner(isDisplay, message = ""){

      this.notificationBanner.setVisible(isDisplay);

      this.notificationText.setVisible(isDisplay);
      this.notificationText.setText(message);

      if(isDisplay){
        this.notificationText.x = this.notificationBanner.x - (this.notificationText.displayWidth / 2);
        this.notificationText.y = this.notificationBanner.y - (this.notificationText.displayHeight / 2);
      }

    }
  
  }
  
  export default NotificationBannerScene;