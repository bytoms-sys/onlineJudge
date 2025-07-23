import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await fetch(`http://localhost:8000/contests/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setContest(data);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setContest(null);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading contest...</div>;
  if (!contest) return <div className="p-8 text-center text-red-600">Contest not found.</div>;

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  let problemsSection = null;
  if (now < start) {
    problemsSection = <div className="text-gray-500">Problems will be visible when the contest starts.</div>;
  } else if (!contest.isRegistered) {
    problemsSection = <div className="text-red-600">You must register for this contest to view and solve problems.</div>;
  } else {
    problemsSection = contest.problems && contest.problems.length > 0 ? (
      <ul className="list-disc ml-6">
        {contest.problems.map((p) => (
          <li key={p._id || p} className="mb-2 flex items-center">
            <Link
              to={`/contests/${id}/problems/${p.problemCode || p}`}
              className="text-indigo-700 underline hover:text-indigo-900 font-medium"
            >
              {p.title || p.problemCode || p}
            </Link>
            <button
              className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
              onClick={() => navigate(`/contests/${id}/problems/${p.problemCode || p}`)}
            >
              Solve Problem
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-gray-500">No problems added yet.</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{contest.name}</h1>
      <div className="mb-2 text-gray-600">{contest.description}</div>
      <div className="mb-4 text-sm text-gray-500">
        Start: {start.toLocaleString()}<br />
        End: {end.toLocaleString()}
      </div>
      <h2 className="text-xl font-semibold mb-2">Problems</h2>
      {problemsSection}
      <button
        className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        onClick={() => navigate(`/contests/${id}/leaderboard`)}
      >
        View Leaderboard
      </button>
    </div>
  );
};

export default ContestDetail;