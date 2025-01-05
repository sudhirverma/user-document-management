import type { TransformFnParams } from 'class-transformer/types/interfaces';
import type { MaybeType } from '../types/maybe.type';

export const lowerCaseTransformer = (
  params: TransformFnParams,
): MaybeType<string> => params.value?.toLowerCase().trim();
