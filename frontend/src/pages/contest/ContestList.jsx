import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [message, setMessage] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch("http://localhost:8000/contests/", {
          credentials: "include",
        });
        const data = await res.json();
        setContests(Array.isArray(data) ? data : (data.contests || []));
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setMessage("Failed to load contests.");
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const handleRegister = async (contestId) => {
    setRegistering(contestId);
    setMessage("");
    try {
      const res = await fetch(`http://localhost:8000/contests/${contestId}/register`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registered successfully!");
        // Refresh contests to update registration status
        const updatedRes = await fetch("http://localhost:8000/contests/", {
          credentials: "include",
        });
        const updatedData = await updatedRes.json();
        setContests(Array.isArray(updatedData) ? updatedData : (updatedData.contests || []));
      } else {
        setMessage(data.error || "Registration failed.");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage("Registration failed.");
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading contests...</div>;
  }

  const now = new Date();
  const upcoming = contests.filter((c) => new Date(c.startTime) > now);
  const running = contests.filter((c) => new Date(c.startTime) <= now && new Date(c.endTime) > now);
  const past = contests.filter((c) => new Date(c.endTime) <= now);

  const isAdmin = user?.role === "admin";

  const renderContestList = (list, showRegister = true, showView = true) => (
  list.length === 0 ? (
    <div className="text-gray-500 text-center py-4">None</div>
  ) : (
    <div className="grid gap-6">
      {list.map((contest) => {
        const isRegistered = contest.participants?.some(
          (p) => p === user?._id || p?._id === user?._id
        );
        return (
          <div key={contest._id} className="bg-white shadow rounded p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">{contest.name}</div>
              <div className="text-gray-600">{contest.description}</div>
              <div className="text-sm text-gray-500 mt-2">
                Start: {new Date(contest.startTime).toLocaleString()}<br />
                End: {new Date(contest.endTime).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 md:mt-0">
              {showView && (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/contests/${contest._id}`)}
                >
                  View
                </button>
              )}
              {showRegister && (
                isRegistered ? (
                  <button
                    className="bg-green-200 text-green-800 px-4 py-2 rounded cursor-not-allowed"
                    disabled
                  >
                    Registered
                  </button>
                ) : (
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={() => handleRegister(contest._id)}
                    disabled={registering === contest._id}
                  >
                    {registering === contest._id ? "Registering..." : "Register"}
                  </button>
                )
              )}
              {isAdmin && (
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  onClick={() => navigate(`/admin/contests/edit/${contest._id}`)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center justify-between">
        Contests
        {isAdmin && (
          <button
            className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800"
            onClick={() => navigate("/admin/contests/create")}
          >
            Create Contest
          </button>
        )}
      </h1>
      {message && (
        <div className="mb-4 text-center text-indigo-700">{message}</div>
      )}

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Running Contests</h2>
        {renderContestList(running, true, true)}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Upcoming Contests</h2>
        {renderContestList(upcoming, true, false)}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Past Contests</h2>
        {renderContestList(past, false, true)}
      </section>
    </div>
  );
};

export default ContestList;