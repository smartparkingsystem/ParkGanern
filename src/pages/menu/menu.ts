import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { User } from '../../models/user';
import { Reservation } from '../../models/reservation';
import * as moment from 'moment';
// import { isObject } from 'ionic-angular/umd/util/util';
// import { startTimeRange } from '@angular/core/src/profile/wtf_impl';
// import { Observable } from 'rxjs/Observable';
// import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Geolocation } from '@ionic-native/geolocation';
// import { convertUrlToDehydratedSegments } from 'ionic-angular/umd/navigation/url-serializer';
// import { last } from 'rxjs/operators';
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
  // lat: any;
  // lng: any;
  lat: number;
  long: number;
  presentDate = moment().format('MMMM DD, YYYY, hh:mm A');
  beforeStartPark;
  beforeEndPark;
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

  // ngOnInit(){
  //   this.long='';
  //   this.lat='';
  // }
  alert(message: string, space: string){
    this.alertCtrl.create({
      title: "Cancellation",
      message: message,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.cancelReservation(space);
          }        
        },
        {
          text: 'No'
        }
      ],
      mode: "ios"
    }).present();
  }

  alert2(message: string){
    this.alertCtrl.create({
      title: "Alert",
      message: message,
      buttons: [
        {
          text: 'Ok'   
        },
        {
          text: 'Cancel'
        }
      ],
      mode: 'ios'
    }).present();
  }

  alert3(message: string){
    this.alertCtrl.create({
      title: "Notice",
      subTitle: message,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.extendParking();
          }        
        },
        {
          text: 'No',
          handler: () => {
            this.reservationPayment();
          }  
        }
      ],
      mode: "ios"
    }).present();
  } 

  ionViewWillLoad() {
   
  }
  
  ionViewDidLoad() {
    this.DisplayMap();
    // this.notifyUser();
    this.afAuth.authState.take(1).subscribe(auth => {
    // var userId = this.afAuth.auth.currentUser.uid;
      this.afDatabase.database.ref(`/users/${auth.uid}`).on('value', userSnapshot => {
        this.user = userSnapshot.val();
        console.log(this.user.hasReserved);
        this.reservation = this.user.reservation;
        var startPark = this.reservation.start;
        var endPark = this.reservation.end;

        this.beforeStartPark = moment(startPark,"hh:mm A").subtract(1, 'minutes').format('hh:mm A');
        this.beforeEndPark = moment(endPark,"hh:mm A").subtract(1, 'minutes').format('hh:mm A');
        var beforeStartPark = this.beforeStartPark;
        var beforeEndPark = this.beforeEndPark;
        
        var currentTime = this.currentTime;

        if (currentTime == beforeStartPark){
          console.log("ALERT 2");
          this.alert2('30 MINS. LEFT before PARKING STARTS.');
          this.sendNotif1();
          return;
        }

        if (currentTime == startPark){
          this.reservation = this.user.reservation;
          var space = this.reservation.space;
          var startPark = this.reservation.start;
          var endPark = this.reservation.end;
          this.alert('Your reservation already started. Would you like to cancel your reservation for space ' + space + ' from ' + startPark + ' to ' + endPark + '?', space);
          
        }

        if (currentTime == beforeEndPark){
          this.alert2('30 MINS. LEFT before PARKING ENDS.');
        }

        if (currentTime == endPark){
          this.alert3('Your reservation has ended. Would you like to extend?')
        }
      });
    });    
    
    this.getLocation();
  }

  profilePage(){
    this.navCtrl.push('UserPage');
  }

  settingsPage(){
    this.navCtrl.push('SettingsPage');
  }

  beginParking(){
    const statusRef: firebase.database.Reference = this.afDatabase.database.ref(`spaces/A1`);
    this.afDatabase.database.ref(`spaces/A1/led_status`).once('value').then(function(snapshot){
      if(snapshot.val() === 1){
        statusRef.update({ led_status: 0})
      }else{
        statusRef.update({ led_status: 1})
      }
    });
  }

  sendNotif1(){
    // var notif = {
    //   'message': 'You have 30 mins. left before parking starts',
    //   'parking_space': 'D2'
    // // }
    console.log("Message sent")
    let notification = {} as Notification;
    this.afAuth.authState.take(1).subscribe(auth => {
      const notificationRef: firebase.database.Reference = this.afDatabase.database.ref(`users/${auth.uid}/notifications`);
      console.log(auth)
      notificationRef.push(notification).then(() => {
        console.log("SEND NOTIF")
        notificationRef.update({notification:"30 MINS. LEFT before PARKING STARTS"})
      })
    });
    // -------------------
    // var uniqueNotif = firebase.database().ref().child('/users/'+this.userId+'/notifications').push().key;
    // this.afAuth.authState.take(1).subscribe(auth => {
    //   console.log("SEND NOTIF")
    //   // this.afDatabase.database.ref('/users/'+this.userId+'/notifications').push("HELLO");
    //   firebase.database().ref('/users/'+this.userId+'/notifications/'+uniqueNotif).set(notif);
    // });
  }

  // sendNotif1(){
  //   console.log("Message sent")
  //   // let notification = {} as Notification;
  //   var thisAuth;
  //   this.afAuth.authState.take(1).subscribe(auth => {
  //     thisAuth = auth;
  //   });
  //   this.afDatabase.database.ref(`users/${auth.uid}/notifications`).push("HELLO");
  // }

  // sendNotif1(){
  //   console.log("Message sent")
    // var userId = this.afAuth.auth.currentUser.uid;
    // this.afAuth.authState.take(1).subscribe(userId => {
    //   // thisAuth = userId;
    // });
    // this.afDatabase.database.ref('users/${userId}/notifications').push("HELLO");

  //   var userId = this.afAuth.auth.currentUser.uid;
  //   this.afDatabase.database.ref(`/users/${userId}/notifications`).push("HELLO");
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
    this.alert('Are you sure you want to cancel your reservation for space ' + reservation.space + ' from ' + reservation.start + ' to ' + reservation.end + '?', reservation.space);
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


  
  logOut(){
    this.afAuth.auth.signOut().then();
    this.navCtrl.setRoot('LoginPage');
  }
// -------------------------------------------------------------------
  // endParking(){
  //   setTimeout(() => {
  //     this.alert2('30 MINS. LEFT before PARKING ENDS.');
  //   },10000)
  // }

  // startParking(){
  //   setTimeout(() => {
  //     this.alert3('First 3 hours of free parking is done. You will now be charged 50PHP every 30mins.');
  //   },10000)
  // }

  // startTimer(){
  //   this.timerVar = Observable.interval(1000).subscribe( x => {
  //     console.log(x)
  //     this.timerVal = x;
  //   })
  // }

  // stopParking(){
  //   this.value = this.timerVar.unsubscribe()
  //   console.log("click");
  //   console.log(this.fee);
  // }

  // enterTime(timer){
  //   timer = timer * 50;
  //   console.log(timer);
  //   document.getElementById('parkFee').innerHTML=timer;
  // }
// -------------------------------------------------------------------
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