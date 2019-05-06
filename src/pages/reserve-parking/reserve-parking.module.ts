import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReserveParkingPage } from './reserve-parking';

@NgModule({
  declarations: [
    ReserveParkingPage,
  ],
  imports: [
    IonicPageModule.forChild(ReserveParkingPage),
  ],
})
export class ReserveParkingPageModule {}
