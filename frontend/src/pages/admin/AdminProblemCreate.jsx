import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProblemCreate = () => {
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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
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
      const res = await fetch(`${backendUrl}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMessage('Problem created successfully!');
        setForm({
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
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        const data = await res.json();
        setMessage(data.error || data.message || 'Error creating problem.');
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage('Error creating problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Problem</h2>
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
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Problem'}
        </button>
      </form>
    </div>
  );
};

export default AdminProblemCreate;