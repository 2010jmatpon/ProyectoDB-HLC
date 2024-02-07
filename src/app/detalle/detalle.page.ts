import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Gol } from '../gol';
import { FirestoreService } from '../firestore.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  id: string = '';
  nuevo: boolean = true;
  existente: boolean = false;

  document: any = {
    id: '',
    goles: {} as Gol,
  };

  constructor(private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService, private router: Router, private alertController: AlertController) {

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
            this.nuevo = false;
            this.existente = true
          } else {
            //No se ha encontrado un document con ese ID. Vaciar los datos que hubiera
            this.document.goles = {} as Gol;
          }
        });
    } else {
      this.id = '';
    }
  }


  async confirmarBorrado() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas borrar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Borrado cancelado');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            console.log('Borrado confirmado');
            this.clickBotonBorrar(); // Llama a la función de borrado cuando el usuario confirma
          }
        }
      ]
    });

    await alert.present();
  }

  clickBotonBorrar(){
    this.firestoreService.borrar("goles", this.id);
    
    console.log('Gol Anulado!');
    
    this.router.navigate(['home'])  ;
  }

  clickBotonModificar() {
    this.firestoreService.modificar("goles", this.id, this.document.goles).then(() => {
      console.log('Registro editado');
      this.router.navigate(['home'])  ;

    }, (error) => {
      console.error(error);
    });
  }


  clickBotonInsertar(){
    this.firestoreService.insertar("goles", this.document.goles).then(() => {
    console.log('Gol Marcado!');
    this.document.goles.jugador= {} as Gol;
    this.router.navigate(['home'])  ;
    }, (error) => {
      console.error(error);
    });
    

  }

  volver(){

    this.router.navigate(['home'])  ;
  }
}
