import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImagesService } from "../../../shared/services/images.service";
import { environment } from "../../../../environments/environment";
import * as randomBytes from "randombytes";

export function imageLoader(imagesService: ImagesService): (file: File) => Observable<string> {
  return (file: File) => {
    const shortName: string = randomBytes(7).toString('hex');
    return imagesService.addImages([{
      file,
      name: `${shortName}.${file.name.split('.')[1]}`,
      newShortName: shortName,
    }]).pipe(
      map(res => (environment.https ? 'https://' : 'http://') + environment.host + ':' + environment.port + '/' + res[0].url),
    )
  }
}
