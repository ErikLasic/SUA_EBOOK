import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authAPI.getUsers()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.response?.data?.message || 'Napaka pri nalaganju uporabnikov'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading users...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">Uporabniki</h2>
        <div className="mb-4 flex justify-end">
          <button
            onClick={async () => {
              if (!window.confirm('Izbrišem vse inactive uporabnike?')) return;
              try {
                await authAPI.deleteInactiveUsers();
                // refresh
                const data = await authAPI.getUsers();
                setUsers(data);
              } catch (err) {
                alert(err.response?.data?.message || 'Napaka pri brisanju');
              }
            }}
            className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
          >
            Izbriši inactive
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Ime</th>
                <th className="py-2">E-pošta</th>
                <th className="py-2">Vloga</th>
                <th className="py-2">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-200">
                  <td className="py-3">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.role}</td>
                  <td className="py-3">
                    <Link to={`/admin/users/${u.id}`} className="text-blue-600 hover:underline">Oglej</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
