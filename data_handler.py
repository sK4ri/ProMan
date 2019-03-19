from persistence import connection_handler


@connection_handler
def get_boards(cursor):
    """
    Gather all boards
    :return: [{'title': board_title, 'columns': [{'title': column_title, 'cards': [{'title': card_title}, {'title': card_title}, ...]}, {'title': column_title, 'cards': [{},...]}, {...}]}, {...}]
    """
    cursor.execute("""
                    SELECT * FROM boards
                    """)
    boards = cursor.fetchall()
    for i, board in enumerate(boards):
        cards = get_cards_by_board_id(board['id'])
        column_ids = list(set([card['status_id'] for card in cards]))
        boards[i]['columns'] = [{'id': column_id, 'title': get_status_title_by_id(column_id)} for column_id in column_ids]
        for j, column in enumerate(boards[i]['columns']):
            boards[i]['columns'][j]['cards'] = [card for card in cards if card['status_id'] == column['id']]
    return boards


@connection_handler
def get_cards_for_board(cursor, board_id):
    cursor.execute("""
                    SELECT * FROM cards
                    WHERE board_id = %(id)s
                    """, {'id': board_id})
    return cursor.fetchall()


@connection_handler
def get_cards_by_board_id(cursor, board_id):
    cursor.execute("""
                    SELECT * FROM cards
                    WHERE board_id = %(id)s
                    """, {'id': board_id})
    return cursor.fetchall()


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
