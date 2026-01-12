import { useState, useEffect } from 'react';
import { X, MapPin, Clock, BookOpen, Plus, History } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { API_URL } from '../config';

const BookHistoryModal = ({ book, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    reading_duration: '',
    notes: ''
  });

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/book-history/${book.id}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/book-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          book_id: book.id,
          ...formData
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({ city: '', reading_duration: '', notes: '' });
        fetchHistory();
      }
    } catch (error) {
      console.error('Error adding history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History size={28} />
              <h2 className="text-2xl font-bold">Book's Journey</h2>
            </div>
            <p className="text-amber-100">"{book.title}" by {book.author}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code Info */}
        <div className="p-6 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <BookOpen className="text-amber-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">QR Code</p>
              <p className="font-mono text-lg font-bold text-gray-800">{book.qr_code}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add History Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Your Chapter to This Book's Story
            </button>
          )}

          {/* Add History Form */}
          {showAddForm && (
            <form onSubmit={handleAddHistory} className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add Your Reading Experience</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    City/Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., New York, USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Reading Duration
                  </label>
                  <input
                    type="text"
                    value={formData.reading_duration}
                    onChange={(e) => setFormData({ ...formData, reading_duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 2 weeks, 1 month"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen size={16} className="inline mr-1" />
                    Notes & Thoughts
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="4"
                    placeholder="Share your thoughts, favorite quotes, or how this book impacted you..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Add to History
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* History Timeline */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <History size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No history yet</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to add a chapter to this book's journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History size={20} />
                Reading History ({history.length} entries)
              </h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 to-orange-500"></div>
                
                {/* History Entries */}
                <div className="space-y-6">
                  {history.map((entry) => (
                    <div key={entry.id} className="relative pl-12">
                      {/* Timeline Dot */}
                      <div className="absolute left-2 top-2 w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                      
                      {/* Entry Card */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-amber-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 text-amber-700">
                            <MapPin size={18} />
                            <span className="font-bold text-lg">{entry.city}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(entry.created_at)}</span>
                        </div>
                        
                        {entry.reading_duration && (
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <Clock size={16} />
                            <span className="text-sm">{entry.reading_duration}</span>
                          </div>
                        )}
                        
                        {entry.notes && (
                          <div className="mt-3 p-3 bg-white/60 rounded-lg">
                            <p className="text-gray-700 text-sm italic">"{entry.notes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookHistoryModal;
