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

  constructor(private activatedRoute: ActivatedRoute, private firestoreService: FirestoreService) {}

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
}
