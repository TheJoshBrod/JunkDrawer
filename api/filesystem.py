"""Web API to interact with filesystem."""
from filepath import FilePath
from flask_cors import CORS
from flask import Flask, send_file, request, jsonify
from helper import (file_id_exists, get_file_name, create_file,
                    create_directory, get_list_of_children, update_access_time,
                    create_default_file, remove_file)


app = Flask(__name__)
CORS(app)

@app.route("/get_file", methods=["POST"])
def get_file():
    """Retrieves user requested file."""
    data = request.get_json()
    if not data.get("parent_id", False) or not data.get("child_name", False):
        return jsonify({"Error": "File does not exist"}), 400

    parent_id = data["parent_id"]
    child_name = data["child_name"]
    children = get_list_of_children(parent_id)

    file_id = -1
    for child in children:
        if child["name"] == child_name and child["is_file"]:
            file_id = child["id"]

    if not file_id_exists(file_id):
        return jsonify({"Error": "File does not exist"}), 400

    file_name = get_file_name(file_id)
    update_access_time(file_id)

    return send_file("../uploads/"+file_id, download_name=file_name), 200

@app.route("/get_children/<file_id>", methods=['GET'])
def get_children(file_id):
    """Returns a list of information about each child."""
    children = get_list_of_children(file_id)

    removed_id_children = []
    for child in children:
        removed_id_children.append(child)
    return jsonify(removed_id_children), 200

@app.route("/upload_file", methods=['POST'])
def upload_file():
    """Creates user uploaded file to appropriate directory."""

    # Verify file was uploaded
    if 'content' not in request.files:
        return jsonify({"error": "No file part"}), 400
    if 'path' not in request.args:
        return jsonify({"error": "No file name"}), 400

    # Get the uploaded file
    file_content = request.files['content']
    file_path = FilePath(request.args['path'])

    # Calculate the size of the file
    file_content.seek(0, 2)
    file_size = file_content.tell()

    # Max file size 1MB
    if file_size > 1e6:
        return jsonify({"message": "File too large (max file size 1MB)"}), 400

    file_content.seek(0)

    id_num, parent_id = create_file(file_content, file_path, file_size)
    if id_num == "" and parent_id == "":
        return jsonify({"message": "Unsuccessful File Upload"}), 400

    # Return success message with the unique file ID
    return jsonify({"message": f"File Uploaded Successfully with ID: {id_num}"}), 200

@app.route("/upload_default_file", methods=['POST'])
def upload_default_file():
    """Creates user uploaded file to appropriate directory."""


    # Verify file was uploaded
    if 'content' not in request.files:
        return jsonify({"error": "No file part"}), 400

    # Get the uploaded file
    file_content = request.files['content']
    parent_id = request.form.get('parentId')
    filename = request.form.get('filename')


    # Calculate the size of the file
    file_content.seek(0, 2)
    file_size = file_content.tell()

    # Max file size 1MB
    if file_size > 1e6:
        return jsonify({"message": "File too large (max file size 1MB)"}), 400

    file_content.seek(0)

    id_num, parent_id = create_default_file(file_content, parent_id, file_size, filename)

    if id_num == "" and parent_id == "":
        return jsonify({"message": "Unsuccessful File Upload"}), 400

    # Return success message with the unique file ID
    return jsonify({"message": f"File Uploaded Successfully with ID: {id_num}"}), 200

@app.route("/upload_directory", methods=['POST'])
def upload_directory():
    """Creates directory."""

    if 'path' not in request.form:
        return jsonify({"error": "No path provided"}), 400

    # Extract the path
    file_path = FilePath(request.form['path'])

    id_num, parent_id = create_directory(file_path)
    if id_num == "" and parent_id == "":
        return jsonify({"message": "Unsuccessful Directory Creation"}), 400

    # Return success message with the unique file ID
    return jsonify({"message": f"Directory Created Successfully with ID: {id_num}"}), 200

@app.route("/delete_file", methods=['POST'])
def delete_file():
    """Deletes file."""
    data = request.get_json()
    keys = list(data.keys())

    if 'parentId' not in keys:
        return jsonify({"error": "Parent not provided"}), 400
    if 'childId' not in keys:
        return jsonify({"error": "Child not provided"}), 400
    if 'filename' not in keys:
        return jsonify({"error": "Filename not provided"}), 400

    # Extract the arguments
    parent_id = data['parentId']
    child_id = data['childId']
    filename = data['filename']

    success = remove_file(parent_id, child_id, filename)
    if not success:
        return jsonify({"message": "Unsuccessful Deletion of File"}), 400

    return jsonify({"message": f"Successfully deleted {filename}"}), 200


if __name__ == "__main__":
    app.run(debug=True)
