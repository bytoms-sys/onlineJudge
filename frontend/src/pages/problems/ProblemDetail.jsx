import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const ProblemDetail = () => {
  const { problemCode } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Fetch problem details when component mounts
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`http://localhost:8000/problems/${problemCode}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Problem not found');
          }
          throw new Error('Failed to fetch problem details');
        }
        
        const data = await response.json();
        setProblem(data);
      } catch (err) {
        console.error('Error fetching problem details:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblem();
  }, [problemCode]);
  
  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };
  
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    
    try {
      const response = await fetch(`http://localhost:8000/problems/${problemCode}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          language,
          code
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit solution');
      }
      
      setSubmitResult({
        success: true,
        message: 'Solution submitted successfully',
        submissionId: data.submission?._id,
        status: data.submission?.status || 'pending'
      });
      
      // Redirect to submission result page if available
      if (data.submission?._id) {
        // You can redirect to a submission detail page here if you have one
        // navigate(`/submissions/${data.submission._id}`);
      }
    } catch (err) {
      setSubmitResult({
        success: false,
        message: err.message || 'Failed to submit solution'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/problems')} 
          className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded"
        >
          Back to Problems
        </button>
      </div>
    );
  }
  
  if (!problem) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p>Problem not found.</p>
        <button 
          onClick={() => navigate('/problems')} 
          className="mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded"
        >
          Back to Problems
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Problem Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}
            >
              {problem.difficulty}
            </span>
            <span className="text-gray-500">Problem Code: {problem.problemCode}</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/problems')}
          className="mt-4 md:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
        >
          Back to Problems
        </button>
      </div>
      
      {/* Problem Description */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap">{problem.description}</div>
        </div>
      </div>
      
      {/* Input/Output Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Input Format</h2>
          <div className="whitespace-pre-wrap">{problem.inputFormat}</div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Output Format</h2>
          <div className="whitespace-pre-wrap">{problem.outputFormat}</div>
        </div>
      </div>
      
      {/* Sample Test Cases */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Sample Test Cases</h2>
        {problem.sampleTestCases && problem.sampleTestCases.length > 0 ? (
          <div className="space-y-6">
            {problem.sampleTestCases.map((testCase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Input</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {testCase.input}
                    </pre>
                  </div>
                  <div className="p-4 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Output</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {testCase.output}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No sample test cases available.</p>
        )}
      </div>
      
      {/* Code Submission Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Submit Your Solution</h2>
        
        {submitResult && (
          <div className={`mb-4 ${submitResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} px-4 py-3 rounded border`}>
            <p>{submitResult.message}</p>
            {submitResult.status && <p className="mt-2">Status: {submitResult.status}</p>}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={handleLanguageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
              <option value="c">C</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Your Code
            </label>
            <textarea
              id="code"
              value={code}
              onChange={handleCodeChange}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`// Write your ${language} solution here...`}
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProblemDetail;