-- USER PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  location text,
  image_url text,
  points int default 0,
  reputation int default 100,
  reputation_tag text, 
  created_at timestamptz default now()
);

-- BOOKS (ONE DIGITAL IDENTITY)
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text,
  condition text check (condition in ('new','used')),
  owner_id uuid references profiles(id),
  location text,
  qr_code text not null,
  is_available boolean default true,
  created_at timestamptz default now(),
  unique(owner_id, title, author)
);

-- BOOK IMAGES
create table book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  image_url text not null
);

-- DEMAND EVENTS (RAW SIGNALS)
create table book_demand_events (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  user_id uuid references profiles(id),
  event_type text check (
    event_type in ('wishlist','search_click','exchange_request')
  ),
  created_at timestamptz default now()
);

-- AI METRICS (GEMINI OUTPUT)
create table book_metrics (
  book_id uuid primary key references books(id) on delete cascade,
  demand_score int,
  rarity_score int,
  ai_point_value int,
  explanation text,
  last_calculated_at timestamptz
);

-- EXCHANGES
create table exchanges (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id),
  from_user uuid references profiles(id),
  to_user uuid references profiles(id),
  points_used int,
  status text check (
    status in ('pending','completed','cancelled')
  ),
  created_at timestamptz default now()
);

-- POINT TRANSACTIONS (LEDGER)
create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  amount int,
  reason text,
  created_at timestamptz default now()
);

-- PAYMENTS (BUY POINTS)
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  provider text,
  amount_paid numeric,
  points_added int,
  status text,
  created_at timestamptz default now()
);

-- WISHLIST
create table wishlists (
  user_id uuid references profiles(id),
  book_id uuid references books(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, book_id)
);

-- QR-BASED BOOK HISTORY (IMMORTAL)
create table book_history (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  city text,
  reading_duration text,
  notes text,
  created_at timestamptz default now()
);

-- EXCHANGE POINTS (STALLS)
create table exchange_points (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text,
  description text,
  location text,
  latitude numeric,
  longitude numeric,
  contact_phone text,
  contact_email text,
  timing text,
  opening_date timestamptz default '2026-01-10 10:47:18.813054+00',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- FORUMS
create table forums (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  created_at timestamptz default now()
);

-- FORUM POSTS (AI MODERATED)
create table forum_posts (
  id uuid primary key default gen_random_uuid(),
  forum_id uuid references forums(id) on delete cascade,
  user_id uuid references profiles(id),
  content text,
  is_anonymous boolean default false,
  ai_flagged boolean default false,
  created_at timestamptz default now()
);

-- CHATS & MESSAGES
create table chats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

create table chat_members (
  chat_id uuid references chats(id) on delete cascade,
  user_id uuid references profiles(id),
  primary key (chat_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  sender_id uuid references profiles(id),
  content text,
  ai_flagged boolean default false,
  created_at timestamptz default now()
);


-- NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY POLICIES

-- Enable RLS on tables
alter table books enable row level security;
alter table book_images enable row level security;

-- BOOKS POLICIES

-- Everyone can read available books
create policy "Books are viewable by everyone" 
on books for select 
using ( true );

-- Authenticated users can create books
create policy "Users can insert their own books" 
on books for insert 
with check ( auth.uid() = owner_id );

-- Users can update their own books
create policy "Users can update their own books" 
on books for update 
using ( auth.uid() = owner_id );

-- Users can delete their own books
create policy "Users can delete their own books" 
on books for delete 
using ( auth.uid() = owner_id );

-- BOOK IMAGES POLICIES

-- Everyone can see book images
create policy "Book images are viewable by everyone" 
on book_images for select 
using ( true );

-- Users can insert images for their books
create policy "Users can insert images for their own books" 
on book_images for insert 
with check ( 
  exists ( 
    select 1 from books 
    where books.id = book_images.book_id 
    and books.owner_id = auth.uid() 
  ) 
);

-- Users can delete images for their books
create policy "Users can delete images for their own books" 
on book_images for delete 
using ( 
  exists ( 
    select 1 from books 
    where books.id = book_images.book_id 
    and books.owner_id = auth.uid() 
  ) 
);
