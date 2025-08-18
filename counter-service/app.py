from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Allow all origins by default; restrict in production if needed
CORS(app)
counter = 0

@app.route("/increment", methods=["POST"])
def increment():
    global counter
    # Če pride neveljaven request (brez JSON), vrni lepši error
    data = request.get_json(silent=True) or {}
    value = data.get("value", 1)
    counter += value
    return jsonify({"counter": counter})

@app.route("/stats", methods=["GET"])
def stats():
    """Vrne trenutno vrednost števca."""
    return jsonify({"counter": counter})

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8003))
    app.run(host="0.0.0.0", port=port)
