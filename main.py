from flask import Flask, render_template, url_for, request, session, redirect, flash
from util import json_response
from util import hash_password, verify_password
import data_handler


app = Flask(__name__)


app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route("/")
@app.route('/<user>/')
def index(user=''):
    """
    This is a one-pager which shows all the boards and cards
    """
    boards = data_handler.get_boards()
    return render_template('index.html', boards=boards, user=user)


@app.route('/create-board')
@json_response
def create_board():
    return data_handler.create_board()


@app.route('/register', methods=['GET', 'POST'])
def register_user():
    if request.method == 'POST' and 'username' not in session:
        session['username'] = request.form['register_name']
        plain_password = request.form['regPassword']
        hashed_pw = hash_password(plain_password)
        data_handler.add_user_to_users_table(session['username'], hashed_pw)
        return redirect(url_for('index', user=session['username']))
    elif 'username' in session:
        flash('Active Login, Logout, then try again.')
        return redirect(url_for('index'))


@app.route('/login', methods=['GET', 'POST'])
def login_user():
    if request.method == 'POST' and 'username' not in session:
        session['username'] = request.form['login_name']
        plain_password = request.form['loginPassword']
        hashed_pw = data_handler.get_user_data(session['username'])
        match = verify_password(plain_password, hashed_pw['password'])
        if match:
            return redirect(url_for('index', user=session['username']))
    else:
        flash('Active login, logout then try again.')
        return redirect(url_for('index'))


@app.route('/logout', methods=['GET', 'POST'])
def logout_user():
    session.pop('username', None)
    session.pop('id', None)
    return redirect(url_for('index'))


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


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
