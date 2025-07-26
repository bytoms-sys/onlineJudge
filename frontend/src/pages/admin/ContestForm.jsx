import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ContestForm = ({ editMode = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    problems: [],
  });
  const [loading, setLoading] = useState(editMode);

  // NEW: State for all contest problems
  const [allProblems, setAllProblems] = useState([]);

  // Fetch contest data if editing
  useEffect(() => {
    if (editMode && id) {
      setLoading(true);
      fetch(`http://localhost:8000/contests/${id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setForm({
            name: data.name || "",
            description: data.description || "",
            startTime: data.startTime ? data.startTime.slice(0, 16) : "",
            endTime: data.endTime ? data.endTime.slice(0, 16) : "",
            problems: data.problems?.map(p => p._id || p) || [],
          });
        })
        .finally(() => setLoading(false));
    }
  }, [editMode, id]);

  // NEW: Fetch all problems and filter for isPractice === false
  useEffect(() => {
    fetch("http://localhost:8000/problems", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const filtered = Array.isArray(data)
          ? data.filter(p => p.isPractice === false)
          : [];
        setAllProblems(filtered);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // NEW: Handle multi-select for problems
  const handleProblemsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm({ ...form, problems: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `http://localhost:8000/contests/${id}`
      : "http://localhost:8000/contests/";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (res.ok) {
      navigate("/contests");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{editMode ? "Edit" : "Create"} Contest</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        {/* NEW: Multi-select for contest problems */}
        <div>
          <label className="block mb-1 font-medium">Select Problems for Contest</label>
<div className="border rounded px-3 py-2 max-h-40 overflow-y-auto">
  {allProblems.length === 0 && (
    <div className="text-gray-500 text-sm">No contest problems available.</div>
  )}
  {allProblems.map((p) => (
    <label key={p._id} className="flex items-center space-x-2 py-1">
      <input
        type="checkbox"
        value={p._id}
        checked={form.problems.includes(p._id)}
        onChange={e => {
          if (e.target.checked) {
            setForm({ ...form, problems: [...form.problems, p._id] });
          } else {
            setForm({ ...form, problems: form.problems.filter(id => id !== p._id) });
          }
        }}
      />
      <span>{p.title} <span className="text-xs text-gray-500">({p.problemCode})</span></span>
    </label>
  ))}
</div>
<div className="text-xs text-gray-500 mt-1">Only non-practice problems are shown.</div>
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {editMode ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default ContestForm;