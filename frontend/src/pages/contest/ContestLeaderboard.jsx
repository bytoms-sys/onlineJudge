import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ContestLeaderboard = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`http://localhost:8000/contests/${id}/leaderboard`, {
          credentials: "include",
        });
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading leaderboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Contest Leaderboard</h1>
      {leaderboard.length === 0 ? (
        <div className="text-gray-500">No leaderboard data available.</div>
      ) : (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-center">Rank</th>
              <th className="px-4 py-2 text-center">User</th>
              <th className="px-4 py-2 text-center">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr key={entry.user?.id || idx}>
                <td className="px-4 py-2 text-center">{idx + 1}</td>
                <td className="px-4 py-2 text-center">
                  {entry.user
                    ? `${entry.user.firstName} ${entry.user.lastName}`
                    : "Unknown"}
                </td>
                <td className="px-4 py-2 text-center">{entry.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContestLeaderboard;