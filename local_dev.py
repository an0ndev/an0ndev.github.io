import pathlib

import flask

app = flask.Flask(__name__)
containing_dir = pathlib.Path(__name__).parent

@app.route("/", defaults = {"path_str": ""})
@app.route("/<path:path_str>")
def all_requests(path_str):
    path = pathlib.Path(path_str)
    if path.is_dir(): path /= "index.html"
    # not worrying about security here (e.g. ".." in path_str, etc.) since this is for local development only
    return flask.send_from_directory(containing_dir, path, as_attachment = False)

if __name__ == "__main__":
    app.run(host = "0.0.0.0")
