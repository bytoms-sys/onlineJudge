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
            problems: data.problems || [],
          });
        })
        .finally(() => setLoading(false));
    }
  }, [editMode, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        {/* You can add a multi-select for problems here if needed */}
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