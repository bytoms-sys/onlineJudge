import { useEffect, useState } from 'react';

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${backendUrl}/submission`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch submissions');
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        setError(err.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">All Submissions</h3>
      {loading ? (
        <div>Loading submissions...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Problem</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map(sub => (
                <tr key={sub._id}>
                  <td className="px-4 py-2">{sub.user?.firstName} {sub.user?.lastName} <br /><span className="text-xs text-gray-500">{sub.user?.email}</span></td>
                  <td className="px-4 py-2">{sub.problemCode}</td>
                  <td className="px-4 py-2">{sub.language}</td>
                  <td className="px-4 py-2">{sub.status}</td>
                  <td className="px-4 py-2">{new Date(sub.submittedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {/* Optionally, link to a submission detail page */}
                    {/* <Link to={`/admin/submissions/${sub._id}`} className="text-blue-600 hover:underline">View</Link> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissions;