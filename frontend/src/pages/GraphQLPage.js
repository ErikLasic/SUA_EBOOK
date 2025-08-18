import React, { useState } from 'react';
import graphqlAPI from '../services/graphql';

const GraphQLPage = () => {
  const [currentQuery, setCurrentQuery] = useState('');
  const [variables, setVariables] = useState('{}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  const presetQueries = [
    {
      name: 'Basic Stats',
      query: 'query GetBasicStats { statistics { totalUsers totalBooks totalReviews averageRating timestamp } }',
      variables: {}
    },
    {
      name: 'All Users',
      query: 'query GetUsers { users { id name email role createdAt reviewCount reviews { id rating reviewText createdAt book { title author } } } }',
      variables: {}
    },
    {
      name: 'All Books',
      query: 'query GetBooks { books { id title author isbn description publishedDate genre pageCount createdAt averageRating reviewCount reviews { id rating reviewText user { name email } } } }',
      variables: {}
    },
    {
      name: 'Variable Stats',
      query: 'query GetVariableStats { bookStatistics { bookId totalReviews averageRating book { title author } } userStatistics { userId totalReviews averageRating user { name email } } }',
      variables: {}
    },
    {
      name: 'Specific Book',
      query: 'query GetBook($bookId: ID!) { book(id: $bookId) { id title author isbn description genre publishedDate pageCount averageRating reviewCount reviews { rating reviewText user { name } } } }',
      variables: { bookId: "68a0b0e771ce2d0ff63e6330" }
    },
    {
      name: 'Specific User',
      query: 'query GetSpecificUser($userId: ID!) { user(id: $userId) { id name email role createdAt reviewCount reviews { id rating reviewText createdAt book { title author genre } } } }',
      variables: { userId: "68a07ca8ced6e431d7903fb0" }
    },
    {
      name: 'Dates Example',
      query: 'query GetDatesExample { users { name createdAt } books { title publishedDate createdAt } reviews { id createdAt updatedAt } }',
      variables: {}
    }
  ];

  const handleHealthCheck = async () => {
    try {
      setLoading(true);
      const data = await graphqlAPI.health();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Health check failed');
      setHealthStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!currentQuery.trim()) {
      setError('Please enter a query');
      return;
    }

    try {
      setLoading(true);
      let parsedVariables = {};
      if (variables.trim()) {
        parsedVariables = JSON.parse(variables);
      }
      const data = await graphqlAPI.query(currentQuery, parsedVariables);
      setResponse(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Query failed');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const selectPresetQuery = (preset) => {
    setCurrentQuery(preset.query);
    setVariables(JSON.stringify(preset.variables, null, 2));
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            GraphQL Playground
          </h1>
          <p className="text-gray-300 text-lg">Test GraphQL queries against the backend service</p>
        </div>

        {/* Health Check Card */}
        <div className="mb-8 p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              Service Health
            </h2>
            <button
              onClick={handleHealthCheck}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
            >
              {loading ? 'Checking...' : 'Check Health'}
            </button>
          </div>
          {healthStatus && (
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
              <pre className="text-green-300 text-sm font-mono overflow-x-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Preset Queries */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Preset Queries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {presetQueries.map((preset) => (
              <button
                key={preset.name}
                onClick={() => selectPresetQuery(preset)}
                className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-lg border border-slate-600 text-white text-left transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {Object.keys(preset.variables).length > 0 ? 'With variables' : 'No variables'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Query Input Panel */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Query Editor</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">GraphQL Query</label>
              <textarea
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                rows={14}
                className="w-full p-4 bg-slate-900/80 border border-slate-600 rounded-lg text-sm font-mono text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                placeholder="Enter your GraphQL query here..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Variables (JSON)</label>
              <textarea
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                rows={4}
                className="w-full p-4 bg-slate-900/80 border border-slate-600 rounded-lg text-sm font-mono text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                placeholder='{"key": "value"}'
              />
            </div>

            <button
              onClick={handleRunQuery}
              disabled={loading || !currentQuery.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Running...
                </span>
              ) : (
                'Run Query'
              )}
            </button>
          </div>

          {/* Response Panel */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Response</h3>
            <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-4 h-96 overflow-auto">
              {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded p-3 mb-2">
                  <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap">{error}</pre>
                </div>
              )}
              {response && (
                <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              )}
              {!error && !response && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🚀</div>
                    <p>Ready to run your first query!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphQLPage;
