import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../../models/user';
import { Reservation } from '../../models/reservation';
import * as moment from 'moment';
import { Geolocation } from '@ionic-native/geolocation';
import * as firebase from 'firebase/app';

declare var google:any;

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  timerVar;
  timerVal;
  value;
  fee;
  lat: number;
  long: number;
  presentDate = moment().format('MMMM DD, YYYY, hh:mm A');
  startPark;
  endPark;
  beforeStartPark;
  beforeEndPark;
  gracePeriod;
  currentTime = moment().format('hh:mm A');
  
  user = {} as User;
  reservation = {} as Reservation;
  public spaces: Array<any> = [];
  userId: any;

  @ViewChild('map') mapRef:ElementRef;
  data:string = '';

  constructor(private platform: Platform, public geolocation: Geolocation, private afAuth: AngularFireAuth, public afDatabase: AngularFireDatabase, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    // this.userId = this.afAuth.auth.currentUser.uid;
    // console.log(this.userId);
  }

  // logged in alert
  alert(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: ['OK']
    }).present();
  }

  // 30 MINS. BEFORE PARKING START
  alert1(message: string){
    this.alertCtrl.create({
      title: "Notice",
      message: message,
      buttons: ['OK'],
      mode: 'ios'
    }).present();
  }

  // STARTED: Continue or Cancel?
  alert2(message: string, space: string, reservation: Reservation){
    this.alertCtrl.create({
      title: "Cancellation",
      message: message,
      buttons: [
        {
          text: 'YES',
          handler: () => {
            this.cancelReservation(space);
          }        
        },
        {
          text: 'NO',
          handler: () => {
            this.continueReservation(reservation);
          }
        }
      ],
      mode: "ios"
    }).present();
  }

  // 30 MINS. BEFORE PARKING ENDS
  alert3(message: string){
    this.alertCtrl.create({
      title: "Notice",
      subTitle: message,
      buttons: ['OK'],
      mode: "ios"
    }).present();
  }

  // ENDED: Extend or not?
  alert4(message: string, reservation: Reservation){
    this.alertCtrl.create({
      title: "Extension",
      subTitle: message,
      buttons: [
        {
          text: 'YES',
          handler: () => {
            this.extendParking();
            // this.continueReservation(reservation);
          }        
        },
        {
          text: 'NO',
          handler: () => {
            this.reservationPayment();
          }  
        }
      ],
      mode: "ios"
    }).present();
  } 

  ionViewWillLoad() {
    // this.checkParking();
  }
  
  ionViewDidLoad() {
    this.DisplayMap();
    this.afAuth.authState.take(1).subscribe(auth => {
    // var userId = this.afAuth.auth.currentUser.uid;
    this.afDatabase.database.ref(`/users/${auth.uid}`).on('value', userSnapshot => {
      this.user = userSnapshot.val();
      console.log(this.user)
    })
      this.afDatabase.database.ref(`/users/${auth.uid}/reservation`).on('value', userSnapshot => {
        userSnapshot.forEach(snapshot => {
          this.reservation = snapshot.val()
        })
        console.log(this.reservation);
        console.log(this.reservation.end)
        var space = this.reservation.space;
        var startPark = this.reservation.start;
        var endPark = this.reservation.end;
        var currentTime = this.currentTime;
        // var gracePeriod = this.gracePeriod;
       
        this.beforeStartPark = moment(startPark,"hh:mm A").subtract(1, 'minutes').format('hh:mm A');
        this.beforeEndPark = moment(endPark,"hh:mm A").subtract(1, 'minutes').format('hh:mm A');
        this.gracePeriod = moment(startPark,"hh:mm A").add(1, 'minutes').format('hh:mm A');
        var beforeStartPark = this.beforeStartPark;
        var beforeEndPark = this.beforeEndPark;
        
        if (currentTime == beforeStartPark){
          this.alert1('10 MINS. LEFT before PARKING STARTS.');
          // this.sendNotif1();
        }

        if (currentTime == startPark){
          // this.reservation = this.user.reservation;
          // var space = this.reservation.space;
          // var startPark = this.reservation.start;
          // var endPark = this.reservation.end;
          this.alert2('Your reservation already started. Would you like to cancel your reservation for space ' + space + ' from ' + startPark + ' to ' + endPark + '?', space, this.reservation); 
        }
    
        // if (currentTime == gracePeriod){
        //   // this.reservation = this.user.reservation;
        //   // var space = this.reservation.space;
        //   // var startPark = this.reservation.start;
        //   // var endPark = this.reservation.end;
        //   this.alert('15 MINS. GRACE PERIOD ENDED. Your reservation for space ' + space + ' from ' + startPark + ' to ' + endPark + ' will be cancelled', space, this.reservation); 
        // }
    
        if (currentTime == beforeEndPark){
          this.alert3('10 MINS. LEFT before PARKING ENDS.');
        }
    
        if (currentTime == endPark){
          this.alert4('Your reservation has ended. Would you like to extend?', this.reservation)
        }
      });
    });    
    
    this.getLocation();
    this.checkParking();
  }
  
  profilePage(){
    this.navCtrl.push('UserPage');
  }

  settingsPage(){
    this.navCtrl.push('SettingsPage');
  }

  aboutPage(){
    this.navCtrl.push('AboutPage');
  }

  contactusPage(){
    this.navCtrl.push('ContactPage');
  }

  beginParking(){
    let reservation = this.reservation;
    const statusRef: firebase.database.Reference = this.afDatabase.database.ref(`spaces/${reservation.space}`);
    this.afDatabase.database.ref(`spaces/${reservation.space}/led_status`).once('value').then(function(snapshot){
      if(snapshot.val() === 1){
        statusRef.update({ led_status: 0})
      }else{
        statusRef.update({ led_status: 1})
      }
    });
  }

  checkParking(){
    let reservation = this.reservation;
    // const statusRef: firebase.database.Reference = this.afDatabase.database.ref(`spaces/${reservation.space}`);
    this.afDatabase.database.ref(`spaces/${reservation.space}/status`).once('value').then(function(snapshot){
      if(snapshot.val() === "occupied"){
        console.log("It's occupied")
        const statusRef: firebase.database.Reference = firebase.database().ref(`spaces/${reservation.space}`);
        firebase.database().ref(`spaces/${reservation.space}/led_status`).once('value').then(function(snapshot){
          if(snapshot.val() === 1){
            statusRef.update({ led_status: 0})
          }else{
            statusRef.update({ led_status: 1})
          }
        });
    
      }else{
        console.log("WRONG PARKING AREA")
        // let reservation = this.reservation;
        // this.mispark()

        firebase.database().ref(`misparking/${reservation.space}`).push(reservation)

      }
    });
  }

  // sendNotif1(){
    // var notif = {
    //   'message': 'You have 30 mins. left before parking starts',
    //   'parking_space': 'D2'
    // // }
    // console.log("Message sent")
    // let notification = {} as Notification;
    // this.afAuth.authState.take(1).subscribe(auth => {
    //   const notificationRef: firebase.database.Reference = this.afDatabase.database.ref(`users/${auth.uid}/notifications`);
    //   console.log(auth)
    //   notificationRef.push(notification).then(() => {
    //     console.log("SEND NOTIF")
    //     notificationRef.update({notification:"30 MINS. LEFT before PARKING STARTS"})
    //   })
    // });
    // -------------------
    // var uniqueNotif = firebase.database().ref().child('/users/'+this.userId+'/notifications').push().key;
    // this.afAuth.authState.take(1).subscribe(auth => {
    //   console.log("SEND NOTIF")
    //   // this.afDatabase.database.ref('/users/'+this.userId+'/notifications').push("HELLO");
    //   firebase.database().ref('/users/'+this.userId+'/notifications/'+uniqueNotif).set(notif);
    // });
  // }

  extendParking(){
    this.navCtrl.push('ExtendPage');
  }

  reservationPayment(){
    this.navCtrl.push('PaymentPage');
  }

  reservationPage(){
    this.navCtrl.push('ReservePage');

    // let alert = this.alertCtrl.create();
    // var userId = this.afAuth.auth.currentUser.uid;
    // var hasReserved: boolean;    

    // this.afDatabase.database.ref(`users/${userId}/hasReserved`).once('value').then(function(snapshot){
    //   hasReserved = snapshot.val();
    //   console.log(hasReserved)      
    // });
  }

  showConfirm(reservation: Reservation){
    this.alert2('Are you sure you want to cancel your reservation for space ' + reservation.space + ' from ' + reservation.start + ' to ' + reservation.end + '?', reservation.space, reservation);
  }

  cancelReservation(space: string){
    this.afAuth.authState.take(1).subscribe(auth => {
      let self = this;
      this.afDatabase.database.ref(`/users/${auth.uid}/reservation`).remove();
      this.afDatabase.database.ref(`/users/${auth.uid}`).update({hasReserved: false});

      this.afDatabase.database.ref(`reservations/${space}`).orderByKey().on('value', function(snapshot){
        snapshot.forEach(function(data){
          var reservationData = data.val();
          if(reservationData.user === auth.uid){
            self.afDatabase.database.ref(`reservations/${space}/${data.key}`).remove();
          }
        });
      });
    });      
  }

  continueReservation(reservation: Reservation){
    
    this.afAuth.authState.take(1).subscribe(auth => {
      reservation.user = auth.uid; 
      this.afDatabase.database.ref(`occupied`).push(reservation);
      this.afDatabase.database.ref(`spaces/${reservation.space}/status`).set("occupied");
    });
  }


  
  logOut(){
    this.afAuth.auth.signOut().then();
    this.navCtrl.setRoot('LoginPage');
  }

  notifUser(){
    this.navCtrl.push('NotifuserPage')
  }

  DisplayMap(){
    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition().then(resp => {
        console.log(resp.coords.latitude);
        let lat = resp.coords.latitude;
        console.log(resp.coords.longitude);
        let long = resp.coords.longitude;

        const location = new google.maps.LatLng('10.640638', '122.227802');
        const location2 = new google.maps.LatLng('10.640707', '122.227724');
        const location3 = new google.maps.LatLng('10.640666', '122.228179');
        const location4 = new google.maps.LatLng('10.640610', '122.228348');
        const location5 = new google.maps.LatLng('10.640501', '122.228300');
        const userLocation = new google.maps.LatLng(lat, long);
        console.log(userLocation)

        const options = {
          // center:location3,
          center:userLocation,
          zoom: 18,
          streetViewControl:false,
          // mapTypeId:'satellite',
          // mapTypeId: 'hybrid' 
        };

        const map = new google.maps.Map(this.mapRef.nativeElement, options);

        this.addMarker(location,map); 
        this.addMarker(location2,map);
        this.addMarker(location3,map);
        this.addMarker(location4,map);
        this.addMarker(location5,map);
        this.addUserMarker(userLocation,map);
      }).catch(() => {
        console.log("Error to get location")
      });
    });
    
  }

  addMarker(position,map){
    return new google.maps.Marker({
      position,
      map
    }); 
  }

  addUserMarker(position,map){
    return new google.maps.Marker({
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      },
      // label:{
      //   text: 'D'
      // },
      position,
      map
    }); 
  }

  getLocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
    this.lat = resp.coords.latitude;
    this.long = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
}