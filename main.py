from flask import Flask, render_template, url_for, jsonify
from util import json_response, extract_form


import data_handler

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    boards = data_handler.get_boards()
    return render_template('index.html', boards=boards)


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


@app.route("/get-board/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_board_by_id(board_id)


@app.route('/edit-board-title', methods=['POST'])
@json_response
def edit_board_title():
    edit_board_title_dict = extract_form()
    data_handler.edit_board_title(edit_board_title_dict['id'], edit_board_title_dict['title'])
    return "success"


def main():
    app.run(debug=True,
            port=5000)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
