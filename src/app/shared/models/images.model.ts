import { TuiFileLike } from "@taiga-ui/kit";

export interface ResultMediaData {
  file: TuiFileLike;
  name: string;
  newShortName?: string;
}
