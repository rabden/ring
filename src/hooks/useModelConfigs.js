
import React from 'react';
import { modelConfig } from '../config/modelConfig';

export const useModelConfigs = () => {
  const data = React.useMemo(() => modelConfig, []);
  return {
    data,
    isLoading: false
  };
};
