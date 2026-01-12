create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, location, image_url, points, reputation)
  values (new.id, new.email, null, null, 0, 100);
  return new;
end;  
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
alter table books enable row level security;
alter table book_images enable row level security;
alter table book_demand_events enable row level security;
alter table book_metrics enable row level security;
alter table exchanges enable row level security;
alter table point_transactions enable row level security;
alter table payments enable row level security;
alter table wishlists enable row level security;
alter table book_history enable row level security;
alter table exchange_points enable row level security;
alter table forums enable row level security;
alter table forum_posts enable row level security;
alter table chats enable row level security;
alter table chat_members enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on profiles for delete
  using (auth.uid() = id);

create policy "Anyone can view available books"
  on books for select
  using (true);

create policy "Users can create their own books"
  on books for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own books"
  on books for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own books"
  on books for delete
  using (auth.uid() = owner_id);

create policy "Anyone can view book images"
  on book_images for select
  using (true);

create policy "Users can add images to their books"
  on book_images for insert
  with check (
    exists (
      select 1 from books
      where books.id = book_images.book_id
      and books.owner_id = auth.uid()
    )
  );

create policy "Users can delete images from their books"
  on book_images for delete
  using (
    exists (
      select 1 from books
      where books.id = book_images.book_id
      and books.owner_id = auth.uid()
    )
  );

create policy "System can track demand events"
  on book_demand_events for insert
  with check (true);

create policy "System can manage book metrics"
  on book_metrics for all
  using (true);

create policy "Users can view exchanges they are part of"
  on exchanges for select
  using (auth.uid() = from_user or auth.uid() = to_user);

create policy "Users can create exchange requests"
  on exchanges for insert
  with check (auth.uid() = to_user);

create policy "Users can update exchanges they are part of"
  on exchanges for update
  using (auth.uid() = from_user or auth.uid() = to_user);

create policy "Users can view their own transactions"
  on point_transactions for select
  using (auth.uid() = user_id);

create policy "System can create transactions"
  on point_transactions for insert
  with check (true);

create policy "Users can view their own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Users can create payments"
  on payments for insert
  with check (auth.uid() = user_id);

create policy "Users can view their wishlists"
  on wishlists for select
  using (auth.uid() = user_id);

create policy "Users can manage their wishlists"
  on wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from their wishlists"
  on wishlists for delete
  using (auth.uid() = user_id);

create policy "Anyone can view book history"
  on book_history for select
  using (true);

create policy "Users can add to book history"
  on book_history for insert
  with check (true);

create policy "Anyone can view exchange points"
  on exchange_points for select
  using (true);

create policy "Users can create exchange points"
  on exchange_points for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their exchange points"
  on exchange_points for update
  using (auth.uid() = owner_id);

create policy "Users can delete their exchange points"
  on exchange_points for delete
  using (auth.uid() = owner_id);

create policy "Anyone can view forums"
  on forums for select
  using (true);

create policy "System can create forums"
  on forums for insert
  with check (true);

create policy "Users can view non-flagged posts"
  on forum_posts for select
  using (ai_flagged = false);

create policy "Users can create posts"
  on forum_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on forum_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on forum_posts for delete
  using (auth.uid() = user_id);

create policy "Users can view their chats"
  on chats for select
  using (
    exists (
      select 1 from chat_members
      where chat_members.chat_id = chats.id
      and chat_members.user_id = auth.uid()
    )
  );

create policy "Users can create chats"
  on chats for insert
  with check (true);

create policy "Users can view chat members of their chats"
  on chat_members for select
  using (
    exists (
      select 1 from chat_members cm
      where cm.chat_id = chat_members.chat_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can join chats"
  on chat_members for insert
  with check (true);

create policy "Users can view messages in their chats"
  on messages for select
  using (
    exists (
      select 1 from chat_members
      where chat_members.chat_id = messages.chat_id
      and chat_members.user_id = auth.uid()
    )
  );

create policy "Users can send messages in their chats"
  on messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from chat_members
      where chat_members.chat_id = messages.chat_id
      and chat_members.user_id = auth.uid()
    )
  );

create policy "Users can view their notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on notifications for insert
  with check (true);

create policy "Users can update their notifications"
  on notifications for update
  using (auth.uid() = user_id);
