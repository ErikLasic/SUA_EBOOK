import React, { useEffect, useState, useCallback, useRef } from 'react';
import loansAPI from '../services/loans';
import { authAPI } from '../services/api';
import { booksAPI } from '../services/books';
// history not required

const Loans = ({ currentUser }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [usersMap, setUsersMap] = useState({});
  const [booksMap, setBooksMap] = useState({});
  const usersMapRef = useRef({});
  const booksMapRef = useRef({});
  

  const fetchLoans = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const data = await loansAPI.list(p);
      // API may return either an array or an object like { items: [...], meta: {...} }
      // Normalize to an array so .map() is always safe in the render.
      let items = [];
      if (Array.isArray(data)) items = data;
      else if (data && Array.isArray(data.items)) items = data.items;
      else items = [];
      setLoans(items);

      // hydrate user emails and book titles for the loans (cache results to avoid duplicate requests)
    const uniqueUserIds = [...new Set(items.map(l => l.userId).filter(Boolean))];
    const uniqueBookIds = [...new Set(items.map(l => l.bookId).filter(Boolean))];

    // fetch missing users (compare against ref to avoid stale deps)
      const missingUserIds = uniqueUserIds.filter(id => !usersMapRef.current[id]);
      if (missingUserIds.length > 0) {
        try {
          const userPromises = missingUserIds.map(id => authAPI.getUser(id).catch(() => null));
          const users = await Promise.all(userPromises);
          const next = { ...usersMapRef.current };
          missingUserIds.forEach((id, idx) => {
            if (users[idx]) next[id] = users[idx];
          });
          usersMapRef.current = next;
          setUsersMap(next);
        } catch (err) {
          console.debug('Failed to fetch some users for loans', err);
        }
      }

      // fetch missing books
    const missingBookIds = uniqueBookIds.filter(id => !booksMapRef.current[id]);
      if (missingBookIds.length > 0) {
        try {
          const bookPromises = missingBookIds.map(id => booksAPI.getBook(id).catch(() => null));
          const books = await Promise.all(bookPromises);
          const nextB = { ...booksMapRef.current };
          missingBookIds.forEach((id, idx) => {
            if (books[idx]) nextB[id] = books[idx];
          });
          booksMapRef.current = nextB;
          setBooksMap(nextB);
        } catch (err) {
          console.debug('Failed to fetch some books for loans', err);
        }
      }
    } catch (e) {
      console.error(e);
      // optionally show toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(page); }, [page, fetchLoans]);

  const onReturn = async (loan) => {
  // Ask whether the book was returned damaged or unharmed.
  // Use a simple prompt so user can type 'damaged' or 'unharmed'. Leave blank for no book-state update.
  const choice = window.prompt("Vrnitev: vpišite 'unharmed' ali 'damaged' (pustite prazno, če brez spremembe)", 'unharmed');
  if (choice === null) return; // user cancelled
  const val = (typeof choice === 'string' ? choice.trim().toLowerCase() : '');
  const payload = { loanId: loan.id };
  if (val === 'damaged' || val === 'unharmed') payload.state = val;
  await loansAPI.returns(payload);
  fetchLoans(page);
  };

  const onExtend = async (loan) => {
    // Prompt user for how many extra days to add, then call API with { extraDays }
    const raw = window.prompt('Podaljšaj izposojo — vnesite število dodatnih dni (npr. 3)', '7');
    if (raw === null) return; // cancelled
    const days = parseInt((typeof raw === 'string' ? raw.trim() : raw), 10);
    if (Number.isNaN(days) || days <= 0) {
      window.alert('Prosim vnesite veljavno pozitivno število dni.');
      return;
    }
    try {
      await loansAPI.extend(loan.id, { extraDays: days });
      fetchLoans(page);
    } catch (err) {
      console.error('Failed to extend loan', err);
      window.alert('Napaka pri podaljšanju izposoje. Preverite konzolo za več informacij.');
    }
  };

  const onEditNote = async (loan) => {
    // Prompt user for new note, prefilled with existing note
    const current = loan.note || '';
    const raw = window.prompt('Uredi opombo za izposojo:', current);
    if (raw === null) return; // cancelled
    const note = typeof raw === 'string' ? raw.trim() : '';
    try {
      await loansAPI.updateNote(loan.id, { note });
      fetchLoans(page);
    } catch (err) {
      console.error('Failed to update note', err);
      window.alert('Napaka pri shranjevanju opombe. Preverite konzolo za več informacij.');
    }
  };

  const onCancel = async (loan) => {
    if (!window.confirm('Ali ste prepričani, da želite preklicati to izposojo?')) return;
    try {
      await loansAPI.cancel(loan.id);
      fetchLoans(page);
    } catch (err) {
      console.error('Failed to cancel loan', err);
      window.alert('Napaka pri preklicu izposoje. Preverite konzolo za več informacij.');
    }
  };

  // Note: extend/update-note/cancel handlers removed; only Return is available in the UI for now.

  const onClearOld = async () => {
    if (!window.confirm('Clear old loans?')) return;
    await loansAPI.clearOld();
    fetchLoans(page);
  };

  return (
    <div className="p-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Izposoja knjig</h2>
          <div className="flex items-center gap-2">
            {currentUser && currentUser.isAdmin && (
              <button className="btn btn-danger" onClick={onClearOld}>Clear old</button>
            )}
          </div>
        </div>

        {loading && <div className="text-gray-600 italic mb-3">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Book</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(Array.isArray(loans) ? loans : []).map(l => {
                const user = usersMap[l.userId];
                const book = booksMap[l.bookId];
                const formatDate = (d) => {
                  try {
                    const dt = new Date(d);
                    if (isNaN(dt)) return d || '—';
                    return dt.toLocaleDateString('sl-SI');
                  } catch (e) { return d || '—'; }
                };

                const statusBadge = (s) => {
                  if (s === 'active') return <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
                  if (s === 'canceled' || s === 'cancelled') return <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Canceled</span>;
                  return <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{s}</span>;
                };

                return (
                  <tr key={l.id} className="hover:bg-white/6">
                    <td className="py-3 px-4 align-top break-words max-w-[220px]">{l.id}</td>
                    <td className="py-3 px-4 align-top break-words max-w-[200px]">
                      {user ? (
                        <div className="text-sm font-medium">{user.email}</div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">{l.userId || '—'}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top break-words max-w-[240px]">
                      {book ? (
                        <div className="text-sm font-medium">{book.title}</div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">{l.bookId || '—'}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top">{formatDate(l.loanDate)}</td>
                    <td className="py-3 px-4 align-top">{formatDate(l.dueDate)}</td>
                    <td className="py-3 px-4 align-top">{statusBadge(l.status)}</td>
                    <td className="py-3 px-4 align-top break-words max-w-[280px]">{l.note || '—'}</td>
                    <td className="py-3 px-4 align-top">
                      {l.status === 'active' ? (
                        <div className="flex items-center gap-2">
                          <button
                            title="Podaljšaj izposojo"
                            className="inline-flex items-center px-2 py-1 text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            onClick={() => onExtend(l)}
                          >
                            Extend
                          </button>

                          <button
                            title="Uredi opombo"
                            className="inline-flex items-center px-2 py-1 text-sm font-medium rounded text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            onClick={() => onEditNote(l)}
                          >
                            Note
                          </button>

                          <button
                            title="Označi kot vrnjeno"
                            className="inline-flex items-center px-2 py-1 text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                            onClick={() => onReturn(l)}
                          >
                            Return
                          </button>

                          <button
                            title="Prekliči izposojo"
                            className="inline-flex items-center px-2 py-1 text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                            onClick={() => onCancel(l)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing {Array.isArray(loans) ? loans.length : 0} loans</div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
            <span className="font-medium">Page {page}</span>
            <button className="btn btn-primary" onClick={() => setPage(p => p+1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loans;
