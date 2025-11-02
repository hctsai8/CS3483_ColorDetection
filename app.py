from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('html', 'index.html')

@app.route('/fingertip')
def fingertip():
    return send_from_directory('html', 'fingertip.html')

@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    return send_from_directory('js', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
