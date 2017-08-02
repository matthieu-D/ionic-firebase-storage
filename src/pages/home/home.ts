import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import * as firebase from 'firebase';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { environment } from '../../environments/environment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  someTextUrl;
  selectedPhoto;
  loading;
  currentImage;

  constructor(public navCtrl: NavController, public camera: Camera, public loadingCtrl: LoadingController) {
    firebase.initializeApp(environment.firebase);
    // this.getSomeText();
  }

  getSomeText() {
    firebase.storage().ref().child('some text').getDownloadURL()
      .then(response => this.someTextUrl = response)
      .catch(error => console.log('error', error))
  }

  grabPicture() {

    const options: CameraOptions = {
      quality: 100,
      targetHeight: 200,
      targetWidth: 200,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();

      this.selectedPhoto  = this.dataURItoBlob('data:image/jpeg;base64,' + imageData);

      this.upload();
    }, (err) => {
      console.log('error', err);
    });
  }

  dataURItoBlob(dataURI) {
    // code adapted from: http://stackoverflow.com/questions/33486352/cant-upload-image-to-aws-s3-from-ionic-camera
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  };

  upload() {
    if (this.selectedPhoto) {
      var uploadTask = firebase.storage().ref().child('images/uploaded.png').put(this.selectedPhoto);
      uploadTask.then(this.onSuccess, this.onError);
    }
  }

  onSuccess = (snapshot) => {
    this.currentImage = snapshot.downloadURL;
    this.loading.dismiss();
  }

  onError = (error) => {
    console.log('error', error);
    this.loading.dismiss();
  }
}
