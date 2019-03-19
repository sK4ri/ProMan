import psycopg2
import psycopg2.extras
import os


def get_connection_string():
    user_name = os.environ.get('PSQL_USER_NAME')
    password = os.environ.get('PSQL_PASSWORD')
    host = os.environ.get('PSQL_HOST')
    database_name = os.environ.get('PSQL_DB_NAME')

    env_variables_defined = user_name and password and host and database_name

    if env_variables_defined:
        return 'postgresql://{user_name}:{password}@{host}/{database_name}'.format(
            user_name=user_name,
            password=password,
            host=host,
            database_name=database_name
        )
    else:
        raise KeyError('Some necessary environment variable(s) are not defined')


def open_database():
    try:
        connection_string = get_connection_string()
        connection = psycopg2.connect(connection_string)
        connection.autocommit = True
    except psycopg2.DatabaseError as exception:
        print('Database connection problem')
        raise exception
    return connection


def connection_handler(function):
    def wrapper(*args, **kwargs):
        connection = open_database()
        dict_cur = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        ret_value = function(dict_cur, *args, **kwargs)
        dict_cur.close()
        connection.close()
        return ret_value

    return wrapper


_cache = {}


@connection_handler
def get_statuses(cursor, force=False):
    if force or 'statuses' not in _cache:
        cursor.execute('''
                        SELECT id, title FROM statuses;
        ''')
        _cache['statuses'] = cursor.fetchall()
    return _cache['statuses']


@connection_handler
def get_cards(cursor, force=False):
    if force or 'cards' not in _cache:
        cursor.execute('''
                        SELECT id, board_id, title, status_id, cards.order FROM cards;
        ''')
        _cache['boards'] = cursor.fetchall()
    return _cache['cards']


@connection_handler
def get_boards(cursor, force=False):
    if force or 'boards' not in _cache:
        cursor.execute('''
                        SELECT id, title FROM boards;
        ''')
        _cache['boards'] = cursor.fetchall()
    return _cache['boards']


def clear_cache():
    for k in list(_cache.keys()):
        _cache.pop(k)
