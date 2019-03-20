from persistence import connection_handler


@connection_handler
def get_boards(cursor):
    """
    Gather all boards
    :return: run this file to see it in the terminal
    """
    cursor.execute("""
                    SELECT * FROM boards
                    """)
    return cursor.fetchall()


@connection_handler
def get_columns_by_board_id(cursor, board_id):
    cursor.execute("""
                    SELECT * FROM boards_statuses
                    WHERE board_id = %(id)s
                    """, {'id': board_id})
    boards_statuses = cursor.fetchall()
    columns = [{'id': status['status_id'], 'title': get_status_title_by_id(status['status_id'])} for status in boards_statuses]

    cards = get_cards_by_board_id(board_id)
    for i, column in enumerate(columns):
        columns[i]['cards'] = [card for card in cards if card['status_id'] == column['id']]
    return columns


@connection_handler
def get_cards_by_board_id(cursor, board_id):
    cursor.execute("""
                    SELECT * FROM cards
                    WHERE board_id = %(id)s
                    """, {'id': board_id})
    return cursor.fetchall()


@connection_handler
def get_board_by_id(cursor, board_id):
    cursor.execute("""
                    SELECT * FROM boards
                    WHERE id = %(id)s
                    """, {'id': board_id})
    board = cursor.fetchall()[0]
    board['columns'] = get_columns_by_board_id(board['id'])
    return board


@connection_handler
def delete_board_by_id(cursor, board_id):
    cursor.execute("""
                    DELETE FROM boards
                    WHERE id = %(id)s
                    """, {'id': board_id})


@connection_handler
def delete_card_by_id(cursor, card_id):
    cursor.execute("""
                    DELETE FROM cards
                    WHERE id = %(id)s
                    """, {'id': card_id})


@connection_handler
def add_column_to_board(cursor, board_id, column_name):
    create_status(column_name)
    cursor.execute("""
                    INSERT INTO boards_statuses(board_id, status_id)
                    VALUES(%(board_id)s, %(status_id)s) 
                    """, {'board_id': board_id, 'status_id': get_status_id_by_name(column_name)})


@connection_handler
def create_status(cursor, status_name):
    if not get_status_id_by_name(status_name):
        cursor.execute("""  
                        INSERT INTO statuses(title)
                        VALUES (%(title)s)
                        """, {'title': status_name})


@connection_handler
def get_status_id_by_name(cursor, status_name):
    # returns False if status does not exist
    cursor.execute("""
                    SELECT id FROM statuses
                    WHERE title = %(title)s
                    """, {'title': status_name})
    fetch = cursor.fetchall()
    return fetch[0]['id'] if fetch else False


@connection_handler
def get_status_title_by_id(cursor, status_id):
    # returns False if status does not exist
    cursor.execute("""
                    SELECT title FROM statuses
                    WHERE id = %(id)s
                    """, {'id': status_id})
    fetch = cursor.fetchall()
    return fetch[0]['title'] if fetch else False


@connection_handler
def edit_board_title(cursor, board_id, title):
    cursor.execute('''
                    UPDATE cards
                    SET title= %s 
                    WHERE id= %s
                    ''', (title, board_id)
                   )


if __name__ == '__main__':
    print(get_board_by_id(1))
    add_column_to_board(1, 'nemtom')
