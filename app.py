from flask import Flask, send_from_directory, abort
import os

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('html', 'dashboard.html')

@app.route('/cursor')
def cursor_detection():
    return send_from_directory('html', 'cursor_detection.html')

@app.route('/fingertip')
def fingertip_detection():
    return send_from_directory('html', 'fingertip_detection.html')

@app.route('/item')
def item_detection():
    return send_from_directory('html', 'item_detection.html')

@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    return send_from_directory('js', filename)

@app.route('/images/<path:filename>')
def image_files(filename):
    if os.path.exists(f'images/{filename}'):
        return send_from_directory('images', filename)
    else:
        abort(404)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
