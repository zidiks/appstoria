import { StateColor } from "../enums/state-colors.enum";

export const stateColors: Record<StateColor, string> = {
  [StateColor.Info]: 'Информация',
  [StateColor.Error]: 'Ошибка',
  [StateColor.Warning]: 'Внимание',
  [StateColor.Neutral]: 'Нейтральный',
  [StateColor.Success]: 'Удачно',
}
