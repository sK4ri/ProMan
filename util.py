from functools import wraps
from flask import jsonify, request


def json_response(func):
    """
    Converts the returned dictionary into a JSON response
    :param func:
    :return:
    """
    @wraps(func)
    def decorated_function(*args, **kwargs):
        return jsonify(func(*args, **kwargs))

    return decorated_function


def extract_form():
    form_input = request.form
    form_dict = {}
    for item in form_input.items():
        form_dict[item[0]] = item[1]
    return form_dict
