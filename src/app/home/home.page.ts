import { Component } from '@angular/core';
import {Gol} from '../gol';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  golEditando = {} as Gol;
  arrayColeccionGoles: any = [{
    id: "",
    gol: {} as Gol,
}];
idGolSelec: string = "";
    formularioAnadir= false;

  constructor(private firestoreService: FirestoreService, private router: Router) {
    this.obtenerListaGoles();
  }

  clickBotonInsertar(){
    this.firestoreService.insertar("goles", this.golEditando).then(() => {
    console.log('Gol Marcado!');
    this.golEditando= {} as Gol;
    this.formularioAnadir = false;
    }, (error) => {
      console.error(error);
    });
  }

  obtenerListaGoles(){
    this.firestoreService.consultar("goles").subscribe((datosRecibidos) => {
      this.arrayColeccionGoles = [];
      datosRecibidos.forEach((datosGol) => {
        this.arrayColeccionGoles.push({
          id: datosGol.payload.doc.id,
          gol: datosGol.payload.doc.data()

        })
      });
    });
  }
  selecGol(idGol:string, golSelec:Gol){
    this.golEditando = golSelec;
    this.idGolSelec = idGol;
    this.router.navigate(['detalle', this.idGolSelec])  ;
  }
  selecNuevo(){

    this.router.navigate(['detalle', 'nuevo'])  ;
  }


  clickBotonBorrar(){
    this.firestoreService.borrar("goles", this.idGolSelec).then(() => {
    console.log('Gol Anulado!');
    this.golEditando= {} as Gol;
    this.idGolSelec = "";
    }, (error) => {
      console.error(error);
    });
  }

  clickBotonModificar() {
    this.firestoreService.modificar("goles", this.idGolSelec, this.golEditando).then(() => {
      console.log('Registro editado');
    }, (error) => {
      console.error(error);
    });
  }
}
