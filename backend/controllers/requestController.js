import { getSupabaseClient } from '../config/supabaseClient.js';

export const createRequest = async (req, res) => {
  const { book_id, offered_points } = req.body;

  try {
    const supabase = getSupabaseClient(req.authToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });
    const requester_id = user.id;
    // 1. Get Book Details (Owner, Points)
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*, owner:profiles!owner_id(id, username)')
      .eq('id', book_id)
      .single();

    if (bookError || !book) return res.status(404).json({ error: 'Book not found' });

    if (book.owner_id === requester_id) {
      return res.status(400).json({ error: 'You cannot request your own book' });
    }

    // Check for existing pending request
    // using global supabase client (likely service role) to bypass RLS visibility issues for unique checks
    console.log(`[createRequest] Checking duplicates for Book: ${book_id}, User: ${requester_id}`);
    const { data: existingRequests, error: existingError } = await supabase
      .from('exchanges')
      .select('id, status')
      .eq('book_id', book_id)
      .eq('to_user', requester_id)
      .eq('status', 'pending');

    if (existingError) {
        console.error('[createRequest] Error checking duplicates:', existingError);
    }

    if (existingRequests && existingRequests.length > 0) {
      console.log('[createRequest] Duplicate found. Blocking.');
      return res.status(400).json({ error: 'You already have a pending request for this book' });
    }

    // 2. Get Requester Points
    const { data: requester, error: userError } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', requester_id)
      .single();

    if (userError) return res.status(500).json({ error: 'User profile not found' });

    const pointsToUse = offered_points || book.points || 10; // Default 10 if not set

    if (requester.points < pointsToUse) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // 3. Create Exchange
    const { data: exchange, error: exchangeError } = await supabase
      .from('exchanges')
      .insert({
        book_id,
        from_user: book.owner_id,
        to_user: requester_id,
        points_used: pointsToUse,
        status: 'pending'
      })
      .select()
      .single();

    if (exchangeError) throw exchangeError;

    // 4. Create Notification for Owner
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: book.owner_id,
        message: `New request for "${book.title}" from user. Offered: ${pointsToUse} pts.`,
        related_book_id: book_id,
        action_link: '/requests?tab=incoming'
      });
      
    if (notifError) console.error("Notification error:", notifError);

    res.status(201).json(exchange);
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'completed' (accepted) or 'cancelled' (rejected)

  try {
    const supabaseClient = getSupabaseClient(req.authToken);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = user.id;

    // 1. Get Exchange
    const { data: exchange, error: fetchError } = await supabaseClient
      .from('exchanges')
      .select('*, book:books(*)')
      .eq('id', id)
      .single();

    if (fetchError || !exchange) return res.status(404).json({ error: 'Request not found' });

    // Verify authority (Only From User i.e. Owner can accept/reject)
    // Actually, 'from_user' is the owner.
    if (exchange.from_user !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (status === 'completed') {
       // ACCEPT FLOW
       // 1. Update Exchange Status
       const { error: updateError } = await supabaseClient
         .from('exchanges')
         .update({ status: 'completed' })
         .eq('id', id);

       if (updateError) throw updateError;
       
       // 2. Transfer Ownership (Using RPC to bypass RLS update policy on 'owner_id')
       const { error: bookError } = await supabaseClient.rpc('transfer_ownership', { 
           book_id: exchange.book_id,
           new_owner_id: exchange.to_user
       });
         
       if (bookError) throw bookError;

       // 3. Transfer Points
       // Deduct from Requester (to_user)
       // Add to Owner (from_user) - OPTIONAL based on requirement, usually points transfer
       const points = exchange.points_used;
       
       // We should ideally use RPC for atomic transaction but doing sequential here
       // Decrement Requester
       await supabaseClient.rpc('decrement_points', { user_id: exchange.to_user, amount: points }); 
       // Increment Owner
       await supabaseClient.rpc('increment_points', { user_id: userId, amount: points });

       // 4. Notify Requester
       await supabaseClient.from('notifications').insert({
         user_id: exchange.to_user,
         message: `Your request for "${exchange.book.title}" was ACCEPTED!`,
         related_book_id: exchange.book_id,
         action_link: `/book/${exchange.book_id}`
       });

    } else if (status === 'cancelled' || status === 'rejected') {
        // REJECT FLOW
        const { error: updateError } = await supabaseClient
         .from('exchanges')
         // Map rejected to cancelled to match DB constraint check(status in ...)
         .update({ status: 'cancelled' })
         .eq('id', id);

        if (updateError) throw updateError;

        // Notify Requester
       await supabaseClient.from('notifications').insert({
         user_id: exchange.to_user,
         message: `Your request for "${exchange.book.title}" was declined.`,
         related_book_id: exchange.book_id,
         action_link: '/requests?tab=outgoing'
       });
    }

    res.json({ message: 'Request updated' });
  } catch (error) {
    console.error('Update Request Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRequests = async (req, res) => {
    const { type } = req.query; // 'incoming' or 'outgoing'

    try {
        const supabase = getSupabaseClient(req.authToken);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });
        const userId = user.id;
        let query = supabase.from('exchanges').select('*, book:books(*), requester:profiles!to_user(username), owner:profiles!from_user(username)');
        
        if (type === 'incoming') {
            query = query.eq('from_user', userId); // I am the owner (from_user)
        } else {
            query = query.eq('to_user', userId); // I am the requester (to_user)
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
