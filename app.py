from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configuring the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///webhook_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database model
class WebhookData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    upload_id = db.Column(db.String(50), unique=True, nullable=False)
    text = db.Column(db.Text, nullable=False)
    status_code = db.Column(db.Integer, nullable=False)
    language_id = db.Column(db.String(10), nullable=False)

    def __repr__(self):
        return f"<WebhookData {self.upload_id}>"

# Create the database (only needed once)
with app.app_context():
    db.create_all()

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json
    upload_id = data.get('upload_id')
    text = data['postprocessed_text'][0]['text']
    status_code = data.get('status_code')
    language_id = data.get('language_id')
    
    # Store the data in the database
    webhook_data = WebhookData(
        upload_id=upload_id,
        text=text,
        status_code=status_code,
        language_id=language_id
    )
    db.session.add(webhook_data)
    db.session.commit()
    
    return jsonify({"message": "Data stored successfully!"}), 200


@app.route("/")
def home():
    return render_template("index.html")


# Get all stored webhook data
@app.route('/webhook/data', methods=['GET'])
def get_all_data():
    all_data = WebhookData.query.all()
    result = [
        {
            "upload_id": data.upload_id,
            "text": data.text,
            "status_code": data.status_code,
            "language_id": data.language_id
        }
        for data in all_data
    ]
    return jsonify(result), 200

# Get data by upload_id
@app.route('/webhook/data/<upload_id>', methods=['GET'])
def get_data_by_upload_id(upload_id):
    data = WebhookData.query.filter_by(upload_id=upload_id).first()
    if data:
        result = {
            "upload_id": data.upload_id,
            "text": data.text,
            "status_code": data.status_code,
            "language_id": data.language_id
        }
        return jsonify(result), 200
    return jsonify({"message": "Data not found"}), 404


if __name__ == "__main__":
    app.run()