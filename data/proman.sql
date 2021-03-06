ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS boards_pk CASCADE;
ALTER TABLE IF EXISTS ONLY public.statuses DROP CONSTRAINT IF EXISTS statuses_pk CASCADE;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_pk CASCADE;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS fk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS fk_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY public.boards_statuses DROP CONSTRAINT IF EXISTS fk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY public.boards_statuses DROP CONSTRAINT IF EXISTS fk_status_id CASCADE;


drop table if exists boards;
drop sequence if exists public.boards_id_seq;
create table boards
(
	id serial not null
		constraint boards_pk
			primary key,
	title text,
	"order" int not null
);

create unique index boards_id_uindex
	on boards (id);

drop table if exists statuses;
drop sequence if exists public.statuses_id_seq;
create table statuses
(
	id serial not null
		constraint statuses_pk
			primary key,
	title text not null
);

drop table if exists cards;
drop sequence if exists public.cards_id_seq;
create table cards
(
	id serial not null
		constraint cards_pk
			primary key,
	board_id integer
		constraint fk_board_id
			references boards
				on delete cascade,
	title text,
	status_id integer
		constraint fk_status_id
			references statuses
				on delete cascade,
	"order" integer
);

create unique index cards_id_uindex
	on cards (id);

create unique index statuses_id_uindex
	on statuses (id);

create unique index if not exists statuses_title_uindex
	on statuses (title);

drop table if exists boards_statuses;
create table boards_statuses
(
	board_id integer not null
		constraint fk_board_id
			references boards
				on delete cascade,
	status_id integer not null
		constraint fk_status_id
			references statuses
				on delete cascade,
	"order" integer not null
);

drop table if exists users;
drop sequence if exists public.users_id_seq;
create table users
(
	id serial not null,
	username varchar(20),
	password varchar(100)
);

create unique index users_id_uindex
	on users (id);

alter table users
	add constraint users_pk
		primary key (id);



INSERT INTO statuses VALUES (1,'new');
INSERT INTO statuses VALUES (2,'in progress');
INSERT INTO statuses VALUES (3,'testing');
INSERT INTO statuses VALUES (4,'done');

SELECT pg_catalog.setval('statuses_id_seq', 4, true);


INSERT INTO boards VALUES (1,'Board 1',1);
INSERT INTO boards VALUES (2,'Board 2',2);

SELECT pg_catalog.setval('boards_id_seq', 2, true);

INSERT INTO cards VALUES (1,1,'new card 1',1,1);
INSERT INTO cards VALUES (2,1,'new card 2',1,2);
INSERT INTO cards VALUES (3,1,'in progress card',2,1);
INSERT INTO cards VALUES (4,1,'planning',3,1);
INSERT INTO cards VALUES (5,1,'done card 1',4,1);
INSERT INTO cards VALUES (6,1,'done card 1',4,2);
INSERT INTO cards VALUES (7,2,'new card 1',1,1);
INSERT INTO cards VALUES (8,2,'new card 2',1,2);
INSERT INTO cards VALUES (9,2,'in progress card',2,1);
INSERT INTO cards VALUES (10,2,'planning',3,1);
INSERT INTO cards VALUES (11,2,'done card 1',4,1);
INSERT INTO cards VALUES (12,2,'done card 1',4,2);

SELECT pg_catalog.setval('cards_id_seq', 12, true);

INSERT INTO boards_statuses VALUES (1,1,1);
INSERT INTO boards_statuses VALUES (1,2,2);
INSERT INTO boards_statuses VALUES (1,3,3);
INSERT INTO boards_statuses VALUES (1,4,4);
INSERT INTO boards_statuses VALUES (2,1,1);
INSERT INTO boards_statuses VALUES (2,2,2);
INSERT INTO boards_statuses VALUES (2,3,3);
INSERT INTO boards_statuses VALUES (2,4,4);
