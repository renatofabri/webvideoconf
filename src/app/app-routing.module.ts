import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallComponent } from './call/call.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  {path: '', component: MainComponent},
  {path: 'call', component: CallComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
