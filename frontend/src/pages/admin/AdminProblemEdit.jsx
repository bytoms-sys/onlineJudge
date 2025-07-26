import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminProblemEdit = () => {
  const { problemCode } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const [form, setForm] = useState({
    title: '',
    problemCode: '',
    description: '',
    difficulty: 'Easy',
    tags: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    points: 100,
    isPractice: true,
    sampleInput: '',
    sampleOutput: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`${backendUrl}/problems/${problemCode}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch problem');
        const data = await res.json();
        setForm({
          title: data.title || '',
          problemCode: data.problemCode || '',
          description: data.description || '',
          difficulty: data.difficulty || 'Easy',
          tags: (data.tags || []).join(', '),
          inputFormat: data.inputFormat || '',
          outputFormat: data.outputFormat || '',
          constraints: data.constraints || '',
          points: data.points || 100,
          isPractice: data.isPractice ?? true,
          sampleInput: data.sampleTestCases?.[0]?.input || '',
          sampleOutput: data.sampleTestCases?.[0]?.output || '',
        });
        // eslint-disable-next-line
      } catch (err) {
        setMessage('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
    // eslint-disable-next-line
  }, [problemCode]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        title: form.title,
        problemCode: form.problemCode,
        description: form.description,
        difficulty: form.difficulty,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        inputFormat: form.inputFormat,
        outputFormat: form.outputFormat,
        constraints: form.constraints,
        points: Number(form.points),
        isPractice: form.isPractice,
        sampleTestCases: [{
          input: form.sampleInput,
          output: form.sampleOutput
        }],
        testCases: [{
          input: form.sampleInput,
          output: form.sampleOutput
        }]
      };
      const res = await fetch(`${backendUrl}/problems/${problemCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMessage('Problem updated successfully!');
        setTimeout(() => navigate('/admin'), 1200);
      } else {
        const data = await res.json();
        setMessage(data.error || data.message || 'Error updating problem.');
      }
    } catch {
      setMessage('Error updating problem.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Problem</h2>
      {message && <div className="mb-4 text-indigo-600">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="problemCode"
          value={form.problemCode}
          onChange={handleChange}
          placeholder="Problem Code (unique)"
          className="w-full border p-2 rounded"
          required
          disabled
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
          rows={4}
          required
        />
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="Tags (comma separated)"
          className="w-full border p-2 rounded"
        />
        <input
          name="inputFormat"
          value={form.inputFormat}
          onChange={handleChange}
          placeholder="Input Format"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="outputFormat"
          value={form.outputFormat}
          onChange={handleChange}
          placeholder="Output Format"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="constraints"
          value={form.constraints}
          onChange={handleChange}
          placeholder="Constraints"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="points"
          type="number"
          value={form.points}
          onChange={handleChange}
          placeholder="Points"
          className="w-full border p-2 rounded"
          required
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isPractice"
            checked={form.isPractice}
            onChange={handleChange}
            className="mr-2"
          />
          Is Practice Problem?
        </label>
        <input
          name="sampleInput"
          value={form.sampleInput}
          onChange={handleChange}
          placeholder="Sample Input"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="sampleOutput"
          value={form.sampleOutput}
          onChange={handleChange}
          placeholder="Sample Output"
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Update Problem
        </button>
      </form>
    </div>
  );
};

export default AdminProblemEdit;