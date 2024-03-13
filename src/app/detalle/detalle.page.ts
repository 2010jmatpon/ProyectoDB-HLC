import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Gol } from '../gol';
import { FirestoreService } from '../firestore.service';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Share } from '@capacitor/share';
@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  id: string = '';
  nuevo: boolean = true;
  existente: boolean = false;
  imagenSelec: string = '';

  document: any = {
    id: '',
    goles: {} as Gol,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private imagePicker: ImagePicker,
    // private socialSharing: SocialSharing
  ) {}

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
            this.existente = true;
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
          },
        },
        {
          text: 'Aceptar',
          handler: () => {
            console.log('Borrado confirmado');
            this.clickBotonBorrar(); // Llama a la función de borrado cuando el usuario confirma
          },
        },
      ],
    });

    await alert.present();
  }

  clickBotonBorrar() {
    this.firestoreService.borrar('goles', this.id);

    console.log('Gol Anulado!');

    this.router.navigate(['home']);
  }

  clickBotonModificar() {
    this.firestoreService.modificar('goles', this.id, this.document.goles).then(
      () => {
        console.log('Registro editado');
        this.router.navigate(['home']);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  clickBotonInsertar() {
    this.firestoreService.insertar('goles', this.document.goles).then(
      () => {
        console.log('Gol Marcado!');
        this.document.goles.jugador = {} as Gol;
        this.router.navigate(['home']);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  volver() {
    this.router.navigate(['home']);
  }

  async seleccionarImagen() {
    //Comprobar si la aplicación tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        //Si no tiene permiso de lectura se solicita al usuario
        if (result == false) {
          this.imagePicker.requestReadPermission();
        } else {
          //Abrir selector de imágenes (ImagePicker)
          this.imagePicker
            .getPictures({
              maximumImagesCount: 1, //Permitir solo 1 imagen
              outputType: 1, //1 = Base64
            })
            .then(
              (results) => {
                //En la variable results se tienen las imágenes seleccionadas
                if (results.length > 0) {
                  //Si el usuario ha elegido alguna imagen
                  //EN LA VARIABLE imagenSelec QUEDA ALMACENADA LA IMAGEN SELECCIONADA
                  this.imagenSelec = 'data:image/jpeg;base64,' + results[0];
                  console.log(
                    'Imagen que se ha seleccionado (en Base64):' +
                      this.imagenSelec
                  );
                  this.subirImagen();
                }
              },
              (err) => {
                console.log(err);
              }
            );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async subirImagen() {
    //Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    //Mensaje de Finalización de subida de la imagen
    const toast = await this.toastController.create({
      message: 'Image was updated succesfully',
      duration: 3000,
    });

    //Carpeta del Storage donde se almacenará la images
    let nombreCarpeta = 'imagenes';

    //Mostrar el mensaje de espera
    loading.present();
    //Asignar el nombre de la imagen en función de la hora actual para
    //  evitar duplicidades de nombre
    let nombreImagen = `${new Date().getTime()}`;
    //Llamar al método que sube la imagen al Storage
    this.firestoreService
      .subirImagenBase64(nombreCarpeta, nombreImagen, this.imagenSelec)
      .then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          //EN LA VARIABLE downloadURL SE OBTIENE LA DIRECCIÓN DE LA IMAGEN
          console.log('downloadURL:' + downloadURL);
          this.document.goles.imagenURL = downloadURL;
          //Mostrar el mensaje de finalización de la subida
          toast.present();
          //Ocultar mensaje de espera
          loading.dismiss();
        });
      });
  }

  async eliminarArchivo(fileURL: string) {
    const toast = await this.toastController.create({
      message: 'File was deleted successfully',
      duration: 3000,
    });
    this.firestoreService.eliminarArchivoPorURL(fileURL).then(
      () => {
        this.document.goles.imagenURL = '';
        toast.present();
      },
      (err) => {
        console.log(err);
      }
    );
  }
  

  async share(){
    await Share.share({
      text: this.document.goles.jugador + ' marcó ' + this.document.goles.numGoles + ' goles en el partido ' + this.document.goles.partidos,
    });
  }
  
}
