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
    boards = cursor.fetchall()
    for i, board in enumerate(boards):
        boards[i]['columns'] = get_columns_by_board_id(board['id'])
    return boards


@connection_handler
def create_board(cursor):
    cursor.execute("""
                    INSERT INTO boards(title)
                    VALUES (%(title)s) 
                    RETURNING *;
                    """, {'title': 'New Board'})
    created_board = cursor.fetchall()[0]
    set_default_columns(created_board['id'])
    return get_board_by_id(created_board['id'])


@connection_handler
def create_column(cursor, board_id, title):
    create_status(title)
    status_id = get_status_id_by_name(title)
    order = max([column['order'] for column in get_columns_by_board_id(board_id)]) + 1 if get_columns_by_board_id(board_id) else 0
    if not board_has_status(board_id, status_id):
        cursor.execute("""
                        INSERT INTO boards_statuses(board_id, status_id, "order")
                        VALUES (%(board_id)s, %(status_id)s, %(order)s)
                        RETURNING *;
                        """, {'board_id': board_id, 'status_id': status_id, 'order': order})
        return cursor.fetchall()[0]


@connection_handler
def rename_column(cursor, board_id, column_id, title):
    new_column_id = create_status(title)['id']
    cursor.execute("""
                    UPDATE cards
                    SET status_id = %(new_id)s
                    WHERE board_id = %(board_id)s AND status_id = %(old_id)s
                    """, {'new_id': new_column_id, 'board_id': board_id, 'old_id': column_id})

    cursor.execute("""
                    UPDATE boards_statuses
                    SET status_id = %(new_id)s
                    WHERE board_id = %(board_id)s AND status_id = %(status_id)s
                    RETURNING *;
                    """, {'new_id': new_column_id, 'board_id': board_id, 'status_id': column_id})
    return cursor.fetchall()[0]


@connection_handler
def board_has_status(cursor, board_id, status_id):
    cursor.execute("""
                    SELECT * FROM boards_statuses
                    WHERE board_id = %(board_id)s AND status_id = %(status_id)s
                    """, {'board_id': board_id, 'status_id': status_id})
    return cursor.fetchall()


@connection_handler
def set_default_columns(cursor, board_id):
    for i in range(1, 5):
        cursor.execute("""
                        INSERT INTO boards_statuses(board_id, status_id, "order") 
                        VALUES (%(board_id)s, %(status_id)s, %(order)s)
                        """, {'board_id': board_id, 'status_id': i, 'order': i-1})


@connection_handler
def get_columns_by_board_id(cursor, board_id, cards=False):
    cursor.execute("""
                    SELECT * FROM boards_statuses
                    WHERE board_id = %(id)s
                    ORDER BY "order"
                    """, {'id': board_id})
    boards_statuses = cursor.fetchall()
    columns = [{'id': status['status_id'], 'title': get_status_title_by_id(status['status_id']), 'order': status['order']} for status in boards_statuses]

    if cards:
        cards = get_cards_by_board_id(board_id)
        for i, column in enumerate(columns):
            columns[i]['cards'] = [card for card in cards if card['status_id'] == column['id']]
    return columns


@connection_handler
def get_cards_by_board_id(cursor, board_id):
    cursor.execute("""
                    SELECT * FROM cards
                    WHERE board_id = %(id)s
                    ORDER BY "order"
                    """, {'id': board_id})
    return cursor.fetchall()


@connection_handler
def create_card(cursor, board_id, status_id):
    order = get_last_card_order(board_id, status_id) + 1
    cursor.execute("""
                    INSERT INTO cards(board_id, title, status_id, "order")
                    VALUES (%(board_id)s, %(title)s, %(status_id)s, %(order)s)
                    RETURNING *;
                    """, {'board_id': board_id, 'title': 'New Card', 'status_id': status_id, 'order': order})
    return cursor.fetchall()[0]


@connection_handler
def get_last_card_order(cursor, board_id, status_id):
    cursor.execute("""
                    SELECT "order" FROM cards
                    WHERE board_id = %(board_id)s AND status_id = %(status_id)s
                    """, {'board_id': board_id, 'status_id': status_id})
    cards = cursor.fetchall()
    return max([card['order'] for card in cards]) if cards else -1


@connection_handler
def get_board_by_id(cursor, board_id):
    cursor.execute("""
                    SELECT * FROM boards
                    WHERE id = %(id)s
                    """, {'id': board_id})
    board = cursor.fetchall()[0]
    board['columns'] = get_columns_by_board_id(board['id'], True)
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
                        RETURNING *;
                        """, {'title': status_name})
        return cursor.fetchall()[0]
    else:
        return {'id': get_status_id_by_name(status_name), 'title': status_name}


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


if __name__ == '__main__':
    print(create_card(1, 2))
