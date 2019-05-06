import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParkingLotPage } from './parking-lot';

@NgModule({
  declarations: [
    ParkingLotPage,
  ],
  imports: [
    IonicPageModule.forChild(ParkingLotPage),
  ],
})
export class ParkingLotPageModule {}
