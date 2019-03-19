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
                    SELECT * FROM cards
                    WHERE board_id = %(id)s
                    """, {'id': board_id})
    cards = cursor.fetchall()
    column_ids = list(set([card['status_id'] for card in cards]))
    columns = [{'id': column_id, 'title': get_status_title_by_id(column_id)} for column_id in column_ids]
    for i, column in enumerate(columns):
        columns[i]['cards'] = [card for card in cards if card['status_id'] == column['id']]
    return columns


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
def get_status_title_by_id(cursor, status_id):
    cursor.execute("""
                    SELECT title FROM statuses
                    WHERE id = %(id)s
                    """, {'id': status_id})
    fetch = cursor.fetchall()
    return fetch[0]['title'] if fetch else 'Unknown'


if __name__ == '__main__':
    print(get_boards())
