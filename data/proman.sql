ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS boards_pk CASCADE;
ALTER TABLE IF EXISTS ONLY public.statuses DROP CONSTRAINT IF EXISTS statuses_pk CASCADE;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_pk CASCADE;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS fk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS fk_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY public.boards_statuses DROP CONSTRAINT IF EXISTS fk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY public.boards_statuses DROP CONSTRAINT IF EXISTS fk_status_id CASCADE;


drop table if exists boards;
create table boards
(
	id serial not null
		constraint boards_pk
			primary key,
	title text
);

create unique index boards_id_uindex
	on boards (id);

drop table if exists statuses;
create table statuses
(
	id serial not null
		constraint statuses_pk
			primary key,
	title text not null
);

drop table if exists cards;
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
				on delete cascade
);


