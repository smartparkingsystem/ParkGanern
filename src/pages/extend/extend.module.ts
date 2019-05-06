import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExtendPage } from './extend';

@NgModule({
  declarations: [
    ExtendPage,
  ],
  imports: [
    IonicPageModule.forChild(ExtendPage),
  ],
})
export class ExtendPageModule {}
