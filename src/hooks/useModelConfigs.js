import { useMemo } from 'react';
import { modelConfig } from '../config/modelConfig';

export const useModelConfigs = () => {
  const data = useMemo(() => modelConfig, []);
  return {
    data,
    isLoading: false
  };
};