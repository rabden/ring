
import * as React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  return (
    <React.Fragment>
      <Navigate to="/" replace />
    </React.Fragment>
  );
};

export default Index;
