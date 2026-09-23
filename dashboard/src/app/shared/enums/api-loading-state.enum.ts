export enum ApiLoadingState {
  Pending = 'PENDING',
  Empty = 'EMPTY',
  Success = 'SUCCESS',
}

export type ApiLoadingStateKeys = keyof typeof ApiLoadingState;
