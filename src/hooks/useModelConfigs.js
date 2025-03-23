
import { useMemo } from 'react';
import { modelConfig } from '../config/modelConfig';
import { getNsfwModelKeys } from '../utils/modelUtils';

export const useModelConfigs = () => {
  const data = useMemo(() => modelConfig, []);
  const nsfwModelKeys = useMemo(() => getNsfwModelKeys(), []);
  
  return {
    data,
    nsfwModelKeys,
    isLoading: false
  };
};
