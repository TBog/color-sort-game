from flask import Flask, render_template, render_template_string, make_response, request
from jinja2 import nodes
from jinja2.utils import markupsafe as Markup
from jinja2.ext import Extension

class IncludeRawExtension(Extension):
    tags = {"include_raw"}

    def parse(self, parser):
        lineno = parser.stream.expect("name:include_raw").lineno
        template = parser.parse_expression()
        result = self.call_method("_render", [template], lineno=lineno)
        return nodes.Output([result], lineno=lineno)

    def _render(self, filename):
        return Markup(self.environment.loader.get_source(self.environment, filename)[0])

app = Flask(__name__)
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True
app.jinja_env.add_extension('jinja2.ext.debug')
app.jinja_env.add_extension(IncludeRawExtension)

@app.route('/favicon.ico')
def favicon():
    # return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')
    return app.send_static_file('favicon.ico')
    
@app.route('/')
def index():
    return render_template('index.html')
    
@app.route('/game')
def game():
    return render_template('game.html')
    
@app.route('/add_bottle', methods=['GET'])
def addBottle():
    colors = request.args.getlist('colors', ['_', '_', '_', '_'])
    height = request.args.get('height', len(colors))
    while len(colors) < height:
        colors.insert(0, '_')
    return render_template_string('{% from \'game.jinja\' import print_bottle %} {{ print_bottle(colors) }}', colors=colors)
    
@app.route('/load_preset', methods=['GET'])
def loadPreset():
    presetName = request.args.get('name')
    preset2Bottles = [
        ["#00F",     "#FF0",     "#FF69B4",  "#87CEEB"],
        ["#006400",  "#FF69B4",  "#8B0000",  "#00F"],
        ["#FFFFF0",  "#7CFC00",  "#00F",     "#87CEEB"],
        ["#FF0",     "#87CEEB",  "#FFA500",  "#FF69B4"],
        ["#00F",     "#7CFC00",  "#FFA500",  "#FF0"],
        ["#FFFFF0",  "#FF69B4",  "#7CFC00",  "#7CFC00"],
        ["#006400",  "#FFA500",  "#87CEEB",  "#006400"],
        ["#FFFFF0",  "#8B0000",  "#8B0000",  "#006400"],
        ["#FFA500",  "#FF0",     "#FFFFF0",  "#8B0000"],
        ["_",        "_",        "_",        "_"],
        ["_",        "_",        "_",        "_"] 
    ];
    presetBottles = [
        ["#006400","#FFA500","#87CEEB","#FF69B4"],
        ["#9ACD32","#F0F","#006400","#87CEEB"],
        ["#8B0000","#800080","#FF0","#FFA500"],
        ["#F0F","#E6E6FA","#FFA500","#F0F"],
        ["#FF4500","#9ACD32","#FF4500","#7CFC00"],
        ["#9ACD32","#E6E6FA","#FF69B4","#800080"],
        ["#8B0000","#7CFC00","#800080","#9ACD32"],
        ["#006400","#E6E6FA","#FF69B4","#FF4500"],
        ["#FF0","#FFA500","#7CFC00","#8B0000"],
        ["#E6E6FA","#FF0","#7CFC00","#FF0"],
        ["#800080","#8B0000","#87CEEB","#F0F"],
        ["#FF4500","#FF69B4","#006400","#87CEEB"],
        ["_","_","_","_"],
        ["_","_","_","_"]
    ];
    print(presetBottles)
    return render_template('preset.html', bottles=presetBottles, name=presetName)
    
@app.route('/choose_color', methods=['GET'])
def chooseColor():
    color = request.args.get('color')
    return render_template('chooseColor.html', color=color)

@app.route('/set_color', methods=['GET'])
def setColor():
    color = request.args.get('color')
    return render_template_string('{% from \'game.jinja\' import print_bottle_content %} {{ print_bottle_content(color) }}', color=color)
    
@app.route('/<int:post_id>')
def post(post_id):
    post = get_post(post_id)
    return render_template('post.html', post=post)
    
@app.route('/cookie/')
@app.route('/cookie/<name>')
def cookie(name=None):
    resp = make_response(render_template('cookie.html', name=name))
    resp.set_cookie('username', name)
    return resp

# \GetColor\venv>.\Scripts\activate.bat
# (venv) \GetColor\venv>cd ..
# (venv) \GetColor>flask --app srv run --debug