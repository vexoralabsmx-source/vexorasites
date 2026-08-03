insert into public.plans(id,name,price_monthly,limits) values
('free','Gratis',0,'{"projects":1,"storage_mb":100,"branding":true}'),
('starter','Emprendedor',24900,'{"projects":5,"storage_mb":1024,"branding":false}'),
('business','Negocio',49900,'{"projects":15,"storage_mb":5120,"branding":false}'),
('pro','Pro',89900,'{"projects":50,"storage_mb":20480,"branding":false}');

insert into public.template_categories(name,slug,sort_order) values ('Moda','moda',1),('Barbería','barberia',2),('Restaurante','restaurante',3),('Agencia','agencia',4),('Gimnasio','gimnasio',5),('Portafolio','portafolio',6) on conflict do nothing;
