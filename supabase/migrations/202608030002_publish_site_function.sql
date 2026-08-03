create or replace function public.publish_site(p_site_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_version_id uuid;
  v_slug text;
begin
  update public.sites
  set published_schema = site_schema,
      status = 'published',
      published_at = now(),
      updated_at = now()
  where id = p_site_id
  returning slug into v_slug;

  if v_slug is null then
    raise exception 'Site not found or access denied';
  end if;

  insert into public.site_versions(site_id, created_by, schema, label)
  select id, auth.uid(), published_schema, 'Publicación'
  from public.sites
  where id = p_site_id
  returning id into v_version_id;

  insert into public.publications(site_id, version_id, slug, published_by)
  values (p_site_id, v_version_id, v_slug, auth.uid());

  return v_version_id;
end;
$$;

grant execute on function public.publish_site(uuid) to authenticated;
