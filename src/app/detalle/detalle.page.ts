import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService, private router: Router) {
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
            console.log(this.document.goles.jugador);
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
    this.firestoreService.borrar("goles", this.id);
    // .then(() => {
    console.log('Gol Anulado!');
    // this.document.data= {} as Gol;
    // this.idGolSelec = "";
    this.router.navigate(['home'])  ;

    // }, (error) => {
    //   console.error(error);
    // });
  }

  clickBotonModificar() {
    this.firestoreService.modificar("goles", this.id, this.golEditando).then(() => {
      console.log('Registro editado');
      this.router.navigate(['home'])  ;

    }, (error) => {
      console.error(error);
    });
  }


  clickBotonInsertar(){
    this.firestoreService.insertar("goles", this.golEditando).then(() => {
    console.log('Gol Marcado!');
    this.golEditando= {} as Gol;
    this.router.navigate(['home'])  ;
    }, (error) => {
      console.error(error);
    });
    

  }
}
