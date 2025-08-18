import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // consider user role from auth context or fetched profile (handle where one of them is missing)
  // eslint-disable-next-line no-unused-vars
  const isAdmin = ((authUser?.role || user?.role || '') + '').toLowerCase() === 'admin';
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchedUsers, setFetchedUsers] = useState(null);
  const [fetchedUser, setFetchedUser] = useState(null);
  const [fetchId, setFetchId] = useState('');

  useEffect(() => {
    let mounted = true;
    const id = authUser?.id || authUser?._id;
    if (!id) {
      setError('Neprijavljen uporabnik');
      setLoading(false);
      return () => { mounted = false; };
    }
    authAPI.getUser(id)
      .then((data) => { if (mounted) setUser(data); })
      .catch((err) => setError(err.response?.data?.message || 'Napaka pri nalaganju profila'))
      .finally(() => setLoading(false));
    return () => { mounted = false; }
  }, [authUser]);

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">Moj profil</h2>
        <div className="mb-6">
          <p><strong>Ime:</strong> {user?.name || '—'}</p>
          <p><strong>E-pošta:</strong> {user?.email || '—'}</p>
          <p><strong>Vloga:</strong> {user?.role || '—'}</p>
          <p>
            <strong>Status:</strong>{' '}
            {user?.status ? (
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.status}
              </span>
            ) : '—'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/profile/edit" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">Uredi profil</Link>
          <Link to="/profile/password" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">Spremeni geslo</Link>
        </div>

        {/* Admin controls: delete by ID and delete inactive users */}
        {authUser?.role === 'admin' && (
          <div className="mt-6 p-4 border-t border-gray-200">
            <h3 className="font-semibold mb-3">Administrator</h3>
            {adminMsg && <div className="alert alert-success mb-3">{adminMsg}</div>}
            {/* --- Admin: fetch users --- */}
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <button
                  disabled={fetchLoading}
                  onClick={async () => {
                    setFetchError('');
                    setFetchedUsers(null);
                    setFetchedUser(null);
                    setFetchLoading(true);
                    try {
                      const res = await authAPI.getUsers();
                      // debug output to console to help diagnose unexpected shapes
                      console.debug('getUsers response:', res);
                      // api may return an array or an object containing the array under different keys
                      if (Array.isArray(res)) {
                        setFetchedUsers(res);
                      } else if (Array.isArray(res.users)) {
                        setFetchedUsers(res.users);
                      } else if (Array.isArray(res.data)) {
                        setFetchedUsers(res.data);
                      } else {
                        // try to find first array in the object
                        const found = Object.values(res).find((v) => Array.isArray(v));
                        if (found) setFetchedUsers(found);
                        else setFetchedUsers([]); // explicit empty
                      }
                    } catch (err) {
                      setFetchError(err.response?.data?.message || 'Napaka pri nalaganju uporabnikov');
                    } finally {
                      setFetchLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {fetchLoading ? 'Nalagam...' : 'Naloži vse uporabnike'}
                </button>
                <input placeholder="ID za iskanje" value={fetchId} onChange={(e)=>setFetchId(e.target.value)} className="form-input" />
                <button
                  disabled={fetchLoading}
                  onClick={async () => {
                    if (!fetchId) { setFetchError('Vnesite ID'); return; }
                    setFetchError('');
                    setFetchedUsers(null);
                    setFetchedUser(null);
                    setFetchLoading(true);
                    try {
                      const u = await authAPI.getUser(fetchId);
                      setFetchedUser(u);
                    } catch (err) {
                      setFetchError(err.response?.data?.message || 'Napaka pri nalaganju uporabnika');
                    } finally {
                      setFetchLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Poišči po ID
                </button>
              </div>
              {fetchError && <div className="alert alert-error mb-3">{fetchError}</div>}
              {/* show fetched user */}
              {fetchedUser && (
                <div className="mb-3 p-3 bg-white/80 rounded-md border">
                  <div><strong>ID:</strong> {fetchedUser._id || fetchedUser.id}</div>
                  <div><strong>Ime:</strong> {fetchedUser.name}</div>
                  <div><strong>E-pošta:</strong> {fetchedUser.email}</div>
                  <div><strong>Vloga:</strong> {fetchedUser.role}</div>
                  <div><strong>Status:</strong> {fetchedUser.status}</div>
                </div>
              )}
              {/* show list */}
              {fetchedUsers && Array.isArray(fetchedUsers) && (
                <div className="mt-3 max-h-56 overflow-auto border rounded-md bg-white/80 p-2">
                  {fetchedUsers.length === 0 && (
                    <div className="p-3 text-sm text-gray-600">Ni najdenih uporabnikov.</div>
                  )}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-600">
                        <th className="px-2 py-1">ID</th>
                        <th className="px-2 py-1">Ime</th>
                        <th className="px-2 py-1">E-pošta</th>
                        <th className="px-2 py-1">Vloga</th>
                        <th className="px-2 py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchedUsers.map((u) => (
                        <tr key={u._id || u.id} className="odd:bg-white/90 even:bg-white/80">
                          <td className="px-2 py-1 font-mono text-xs">{u._id || u.id}</td>
                          <td className="px-2 py-1">{u.name}</td>
                          <td className="px-2 py-1">{u.email}</td>
                          <td className="px-2 py-1">{u.role}</td>
                          <td className="px-2 py-1">{u.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center mb-3">
              <input
                placeholder="Uporabnik ID za izbris"
                value={deleteId}
                onChange={(e) => setDeleteId(e.target.value)}
                className="form-input w-full"
              />
              <button
                disabled={adminLoading}
                onClick={async () => {
                  if (!deleteId) {
                    setAdminMsg('Vnesite ID uporabnika');
                    return;
                  }
                  /* eslint-disable no-restricted-globals */
                  if (!window.confirm(`Izbrišem uporabnika z ID ${deleteId}?`)) return;
                  /* eslint-enable no-restricted-globals */
                  setAdminLoading(true);
                  setAdminMsg('');
                  try {
                    await authAPI.deleteUser(deleteId);
                    setAdminMsg(`Uporabnik ${deleteId} je bil izbrisan.`);
                    setDeleteId('');
                  } catch (err) {
                    setAdminMsg(err.response?.data?.message || 'Napaka pri brisanju uporabnika');
                  } finally {
                    setAdminLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
              >
                Izbriši po ID
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <button
                disabled={adminLoading}
                onClick={async () => {
                  /* eslint-disable no-restricted-globals */
                  if (!window.confirm('Izbrišem vse neaktivne uporabnike?')) return;
                  /* eslint-enable no-restricted-globals */
                  setAdminLoading(true);
                  setAdminMsg('');
                  try {
                    const res = await authAPI.deleteInactiveUsers();
                    setAdminMsg(res?.message || 'Neaktivni uporabniki izbrisani.');
                  } catch (err) {
                    setAdminMsg(err.response?.data?.message || 'Napaka pri brisanju neaktivnih');
                  } finally {
                    setAdminLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
              >
                Izbriši neaktivne
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
