import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Gol } from '../gol';
import { FirestoreService } from '../firestore.service';


@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  id: string = '';

  document: any = {
    id: '',
    goles: {} as Gol,
  };
  router: any;

  constructor(private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService) {
    this.obtenerListaGoles();

  }

  ngOnInit() {
    //Se almacena en una variable el id que se ha recibido desde la página anterior
    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    if (idRecibido != null) {
      this.id = idRecibido;

      //Se hace la consulta a la base de datos para obtener los datos asociados a esa id
      this.firestoreService
        .consultarPorId('goles', this.id)
        .subscribe((resultado: any) => {
          //Preguntar si se ha encontrado un document con ese id
          if (resultado.payload.data() != null) {
            this.document.id = resultado.payload.id;
            this.document.goles = resultado.payload.data();
            //Como ejemplo, mostrar el título de la tarea en consola
            console.log(this.document.data.jugador);
          } else {
            //No se ha encontrado un document con ese ID. Vaciar los datos que hubiera
            this.document.goles = {} as Gol;
          }
        });
    } else {
      this.id = '';
    }
  }

  golEditando = {} as Gol;
  arrayColeccionGoles: any = [{
    id: "",
    gol: {} as Gol
}];
idGolSelec: string = "";

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
    this.firestoreService.modificar("tareas", this.idGolSelec, this.golEditando).then(() => {
      console.log('Registro editado');
    }, (error) => {
      console.error(error);
    });
  }
}