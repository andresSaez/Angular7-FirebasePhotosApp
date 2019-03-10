import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { FileItem } from '../models/file-item';
import * as firebase from 'firebase/app';
import 'firebase/storage'; // naked import to bring in feature




@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

  private CARPETA_IMAGENES = 'img';

  constructor(
    private db: AngularFirestore
  ) { }

  private guardarImagen( imagen: { nombre: string, url: string } ) {

    console.log('GUARDANDO');
    console.log(imagen);
    this.db.collection(`/${ this.CARPETA_IMAGENES }`)
      .add( imagen );
  }

  cargarImagenesFirebase( imagenes: FileItem[] ) {

    const storageRef = firebase.storage().ref();

    for ( const item of imagenes ) {
      item.estaSubiendo = true;

      if ( item.progreso >= 100) {
        continue;
      }

      const uploadTask: firebase.storage.UploadTask =
        storageRef.child(`${ this.CARPETA_IMAGENES }/${ item.nombreArchivo }`)
          .put( item.archivo);

      uploadTask.on( firebase.storage.TaskEvent.STATE_CHANGED,
          ( snapshot: firebase.storage.UploadTaskSnapshot ) => {
            console.log(snapshot);
            item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes ) * 100;
          },
          ( error ) => console.log('Error al subir: ' + error ),
          async () => {
            console.log('Imagen cagada correctamente');
// tslint:disable-next-line: deprecation
            console.log(uploadTask);
            item.url = await uploadTask.snapshot.ref.getDownloadURL();
            item.estaSubiendo = false;
            this.guardarImagen ({
              nombre: item.nombreArchivo,
              url: item.url
            });
          } );
    }
  }

}
