import React, { useEffect, useState } from 'react';
import recommendationsAPI from '../services/recommendations';
import booksAPI from '../services/books';
import { Link } from 'react-router-dom';

const Recommendations = () => {
    const [loading, setLoading] = useState(true);
    const [userItems, setUserItems] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        
        const load = async () => {
            try {
                setLoading(true);
                
                // derive user id from stored user object
                let userIdLocal = null;
                try { 
                    const u = JSON.parse(localStorage.getItem('user') || 'null'); 
                    userIdLocal = u?._id || u?.id || u?.sub || null; 
                } catch(e) { 
                    userIdLocal = null; 
                }

                if (!userIdLocal) {
                    if (mounted) {
                        setUserItems([]);
                        setError('Uporabnik ni prijavljen');
                    }
                    return;
                }

                const userData = await recommendationsAPI.getForUser(userIdLocal);

                // normalize user recommendations
                let uList = [];
                if (Array.isArray(userData)) uList = userData;
                else if (userData && Array.isArray(userData.recommendations)) uList = userData.recommendations;
                else if (userData && Array.isArray(userData.items)) uList = userData.items;
                else uList = [];

                // Fetch book details for each recommendation
                const enrichedItems = await Promise.all(
                    uList.map(async (item) => {
                        try {
                            const bookData = await booksAPI.getBook(item.bookId);
                            return {
                                ...item,
                                title: bookData.title,
                                author: bookData.author,
                                genre: bookData.genre
                            };
                        } catch (e) {
                            return {
                                ...item,
                                title: `Knjiga ${item.bookId}`,
                                author: 'Neznano',
                                genre: 'Neznano'
                            };
                        }
                    })
                );

                if (mounted) {
                    setUserItems(enrichedItems);
                }
            } catch (err) {
                const message = err?.response?.data?.detail || err.message || 'Request failed';
                if (mounted) setError(message);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        
        load();
        return () => (mounted = false);
    }, []);

	if (loading) return <div className="p-6">Nalaganje priporočil...</div>;
	if (error) return <div className="p-6 text-red-500">Napaka: {error}</div>;

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Priporočila za vas</h1>
			
			{userItems.length === 0 ? (
				<div className="text-gray-500">Ni priporočil za vas.</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{userItems.map((item) => (
						<div key={item.bookId} className="p-4 border rounded-md bg-white/5">
							{item.bookId ? (
								<Link to={`/books/${item.bookId}`} className="block">
									<div className="font-semibold text-lg">{item.title}</div>
									<div className="text-sm text-gray-400">Avtor: {item.author}</div>
									<div className="text-sm text-gray-400">Žanr: {item.genre}</div>
									<div className="text-sm text-gray-500 mt-2">Ocena: {item.score ?? '—'}</div>
								</Link>
							) : (
								<div>
									<div className="font-semibold text-lg">Neznano</div>
									<div className="text-sm text-gray-400">Ocena: {item.score ?? '—'}</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Recommendations;
