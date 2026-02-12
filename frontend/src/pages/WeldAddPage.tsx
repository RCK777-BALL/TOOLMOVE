import { useNavigate } from 'react-router-dom';
import { AddWeldForm } from '../components/AddWeldForm';

export function WeldAddPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Create</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">New Weld Touch Up</h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
      </div>
      <AddWeldForm onSuccess={() => navigate('/welds')} onCancel={() => navigate(-1)} />
    </div>
  );
}
