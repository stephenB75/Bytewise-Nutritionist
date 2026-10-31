-- Friends & family: members connect by invitation and see only what each other chooses to share.

create table if not exists public.friend_connections (
  id serial primary key,
  requester_id uuid not null references public.users(id) on delete cascade,
  addressee_id uuid not null references public.users(id) on delete cascade,
  status varchar(20) not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamp not null default now(),
  responded_at timestamp,
  constraint friend_connections_not_self check (requester_id <> addressee_id)
);

-- One connection per pair, whichever side sent it.
create unique index if not exists friend_connections_pair_idx
  on public.friend_connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friend_connections_addressee_idx on public.friend_connections (addressee_id);

create table if not exists public.shared_activities (
  id serial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  activity_type varchar(30) not null check (activity_type in ('summary', 'meal', 'fast', 'water')),
  title varchar(200) not null,
  details jsonb,
  note varchar(280),
  created_at timestamp not null default now()
);

create index if not exists shared_activities_user_created_idx
  on public.shared_activities (user_id, created_at desc);

alter table public.friend_connections enable row level security;
alter table public.shared_activities enable row level security;

create policy friend_connections_policy on public.friend_connections
  using ((select auth.uid()) in (requester_id, addressee_id))
  with check ((select auth.uid()) = requester_id);

create policy shared_activities_owner_policy on public.shared_activities
  using ((select auth.uid()) = user_id);

create policy shared_activities_friends_read on public.shared_activities
  for select using (
    exists (
      select 1 from public.friend_connections fc
      where fc.status = 'accepted'
        and (
          (fc.requester_id = (select auth.uid()) and fc.addressee_id = shared_activities.user_id)
          or (fc.addressee_id = (select auth.uid()) and fc.requester_id = shared_activities.user_id)
        )
    )
  );
