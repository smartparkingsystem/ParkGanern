import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminContactsPage } from './admin-contacts';

@NgModule({
  declarations: [
    AdminContactsPage,
  ],
  imports: [
    IonicPageModule.forChild(AdminContactsPage),
  ],
})
export class AdminContactsPageModule {}
