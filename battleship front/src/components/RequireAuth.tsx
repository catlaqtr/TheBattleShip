import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../services/auth';

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
