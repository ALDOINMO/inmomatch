-- RLS base preparada para InmoMatch.
-- Prisma usa tablas con nombres snake_case. Ajustar claims si se decide incluir role/real_estate_id en JWT.

alter table users enable row level security;
alter table real_estates enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table clients enable row level security;
alter table matches enable row level security;
alter table notifications enable row level security;
alter table memberships enable row level security;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

create policy "Users read themselves"
on users for select
using (auth_user_id::uuid = auth.uid());

create policy "Tenant users read same real estate"
on users for select
using (
  real_estate_id in (
    select real_estate_id from users where auth_user_id::uuid = auth.uid()
  )
);

create policy "Properties read tenant or network active"
on properties for select
using (
  status = 'ACTIVE'
  or real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid())
);

create policy "Properties mutate tenant"
on properties for all
using (real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid()))
with check (real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid()));

create policy "Clients mutate tenant"
on clients for all
using (real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid()))
with check (real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid()));

create policy "Matches visible to involved tenants"
on matches for select
using (
  client_id in (select id from clients where real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid()))
  or property_id in (select id from properties where real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid()))
);

create policy "Images visible for visible properties"
on property_images for select
using (property_id in (select id from properties));

create policy "Notifications visible to recipient"
on notifications for select
using (
  user_id in (select id from users where auth_user_id::uuid = auth.uid())
  or real_estate_id in (select real_estate_id from users where auth_user_id::uuid = auth.uid())
);
