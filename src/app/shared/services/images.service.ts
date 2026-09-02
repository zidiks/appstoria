import { Injectable } from '@angular/core';
import { HttpService } from "./http.service";
import { map, Observable } from "rxjs";
import { TuiFileLike } from "@taiga-ui/kit";
import { blobToFile } from "../functions/blob-to-file.func";
import { AddImagesResponseDto } from "../dto/images.dto";
import { ResultMediaData } from "../models/images.model";
import { environment } from "../../../environments/environment";
import {
  CropImageDto,
  ImageJobDto,
  ImageJobSummaryDto,
  StoredImageResultDto
} from "../dto/image-processing.dto";

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

  /** Полный адрес картинки — для превью в кадрировании */
  public getImageUrl(name: string): string {
    const protocol = environment.https ? 'https' : 'http';
    const host = environment.currentOrigin ? window.location.hostname : environment.host;
    const port = environment.port ? `:${environment.port}` : '';
    return `${protocol}://${host}${port}/storage/images/${name}`;
  }

  public addImages(images: ResultMediaData[], process: boolean = false): Observable<AddImagesResponseDto[]> {
    const formData: FormData = new FormData();
    images.forEach((media) => { formData.append('image', media.file as unknown as File, media.name); });
    return this.http.post<AddImagesResponseDto[], FormData>(`storage/upload${process ? '?process=true' : ''}`, formData);
  }

  public deleteImage(name: string): Observable<any> {
    return this.http.delete('storage/images', name);
  }

  /** Обработка всех изображений одного товара */
  public processProductImages(productId: string, force: boolean = false): Observable<ImageJobSummaryDto> {
    return this.http.post<ImageJobSummaryDto, { force: boolean }>(`storage/process/product/${productId}`, { force });
  }

  /** Повторная обработка выбранных файлов */
  public processImages(files: string[], force: boolean = false): Observable<ImageJobSummaryDto> {
    return this.http.post<ImageJobSummaryDto, { files: string[]; force: boolean }>('storage/process/files', { files, force });
  }

  /** Массовый прогон по всем товарам — возвращает задачу, за которой следим по id */
  public processAllImages(force: boolean = false): Observable<ImageJobDto> {
    return this.http.post<ImageJobDto, { force: boolean }>('storage/process/all', { force });
  }

  public getImageJob(jobId: string): Observable<ImageJobDto> {
    return this.http.get<ImageJobDto>(`storage/process/jobs/${jobId}`);
  }

  public cropImage(payload: CropImageDto): Observable<StoredImageResultDto> {
    return this.http.post<StoredImageResultDto, CropImageDto>('storage/crop', payload);
  }
}
