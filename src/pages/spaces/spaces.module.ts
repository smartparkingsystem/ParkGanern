import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SpacesPage } from './spaces';

@NgModule({
  declarations: [
    SpacesPage,
  ],
  imports: [
    IonicPageModule.forChild(SpacesPage),
  ],
})
export class SpacesPageModule {}
