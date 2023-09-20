import { Injectable } from '@angular/core';
import { HttpService } from "./http.service";
import { map, Observable } from "rxjs";
import { TuiFileLike } from "@taiga-ui/kit";
import { blobToFile } from "../functions/blob-to-file.func";
import { AddImagesResponseDto } from "../dto/images.dto";
import { ResultMediaData } from "../models/images.model";

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(
    private http: HttpService,
  ) { }

  public getImage(name: string): Observable<TuiFileLike | null> {
    return this.http.getImage(`storage/images/${name}`).pipe(
      map((blob: Blob) => {
        return blob ? blobToFile(blob, name) : null;
      })
    );
  }

  public addImages(images: ResultMediaData[]): Observable<AddImagesResponseDto[]> {
    const formData: FormData = new FormData();
    images.forEach((media) => { formData.append('image', media.file as unknown as File, media.name); });
    return this.http.post<AddImagesResponseDto[], FormData>('storage/upload', formData);
  }

  public deleteImage(name: string): Observable<any> {
    return this.http.delete('storage/images', name);
  }
}
