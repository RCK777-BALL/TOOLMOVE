import { useNavigate } from 'react-router-dom';
import { AddWeldForm } from '../components/AddWeldForm';

export function WeldAddPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      
      <AddWeldForm onSuccess={() => navigate('/welds')} onCancel={() => navigate(-1)} />
    </div>
  );
}
