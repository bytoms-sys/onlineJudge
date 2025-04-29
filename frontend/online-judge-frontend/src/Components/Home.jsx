import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-6">
          Welcome to CodeJudge
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master coding skills with our interactive platform. Practice problems, 
          compete in challenges, and become a better developer.
        </p>

        {/* Auth Buttons */}
        <div className="flex justify-center gap-6 mb-16">
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg 
              font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg 
              font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Register
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Solve Problems</h3>
            <p className="text-gray-600">
              Access our curated collection of coding challenges
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Track Progress</h3>
            <p className="text-gray-600">
              Detailed analytics for your coding journey
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Compete</h3>
            <p className="text-gray-600">
              Participate in coding contests and leaderboards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;