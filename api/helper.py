"""Helper Functions for filesystem.py."""
import sqlite3
import os
import uuid
import math
from pathlib import Path
from markupsafe import escape
from filepath import FilePath

def update_access_time(file_id: str):
    """Changes the access time of a file to be the present."""
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()
        update_query = "UPDATE filesystem SET accessed_at = CURRENT_TIMESTAMP WHERE id = ?"
        cur.execute(update_query, (file_id,))
        conn.commit()

def create_child(result: list) -> dict:
    """Extracts child information into dictionary."""
    extension = result[0]
    name = result[1]

    is_file = result[3]

    file_sizes = ["B", "KB", "MB", "GB", "TB"]
    size = result[2]
    if is_file and size != "0":
        int_size = int(size)
        log_size = int(math.log(int_size, 1000))
        size = str(round(int_size/(1000 ** (log_size)), 2)) + " " + file_sizes[log_size]
    else:
        size = "0 B"

    created_at = result[4]
    id_num = result[5]

    child = {"extension": extension,
                "name": name,
                "size": size,
                "is_file": is_file,
                "created_at": created_at,
                "id": id_num}
    return child

def get_list_of_children(parent_id: str) -> list:
    """Returns a list of all children."""
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()
        select_query = """SELECT extension, name, file_size, is_file, created_at, id
                            FROM filesystem
                            WHERE parent_id = ?"""
        cur.execute(select_query, (parent_id,))
        results = cur.fetchall()
    children = []
    for result in results:
        child = create_child(result)
        children.append(child)
    return children

def file_id_exists(file_id: str) -> bool:
    """Takes in file uuid string and returns if file exists in file system"""
    file_id = escape(file_id)

    file_path = Path(f'uploads/{file_id}')
    if os.path.exists(file_path):
        print(f"The file {file_path} exists.")

    return True

def get_file_name(file_id: str) -> str:
    """Returns filename.extension"""

    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()
        select_query = "SELECT name FROM filesystem WHERE id = ? AND is_file = TRUE"
        cur.execute(select_query, (file_id,))
        results = cur.fetchall()

    if len(results) == 0:
        return "-1"

    file_name = results[0][0]
    return file_name

def find_child(parent_id: str, child_name: str, is_file: bool) -> str:
    """Finds child_id given parent_id and child_name."""

    # Create connection to database
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()
        find_directory_query = """SELECT id FROM filesystem
                                    WHERE name = ? AND parent_id = ? AND is_file = ?"""
        cur.execute(find_directory_query, (child_name, parent_id, is_file))
        results = cur.fetchall()
        if not results:
            return "-1"
        return results[0][0]

def valid_new_filepath(fileobject: FilePath, checking_for_file: bool = True) -> str:
    """Finds parent_id of lowest child of file/dir 
        (-1: does NOT exist, parent_id: DOES exist)."""

    # Root parent_id
    parent_id = "0"

    # Traverse File System Tree
    for path in fileobject[:-1]:
        parent_id = find_child(parent_id, path, False)
        if parent_id == "-1":
            return "-1"

    # Check if child already exists
    child_id = find_child(parent_id, fileobject[-1], checking_for_file)
    if child_id != "-1":
        return "-1"

    # return parent_id of the child
    return parent_id


def create_file(file_content, virtual_file_path: FilePath, file_size: int) -> str:
    """Creates a local copy of the file and entry into filesystem. Returns id and parent_id."""

    # Is this a valid path? (do parents exist and does child already exist)?
    parent_id = valid_new_filepath(virtual_file_path)
    if parent_id == "-1":
        return "",""

    # Generate a unique filename for the uploaded file
    id_num = str(uuid.uuid4())
    filename = f"{id_num}"
    physical_filepath = os.path.join('uploads', filename)

    # Save file to file system
    try:
        file_content.save(physical_filepath)
    except:
        return "",""

    # Enter Entry into the DB for the new file
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()

        insert_query = """INSERT INTO filesystem
                        (id, name, extension, parent_id, file_size, is_file)
                        VALUES (?, ?, ?, ?, ?, ?)"""

        params = (
            id_num,
            virtual_file_path.name,
            virtual_file_path.extension,
            parent_id,
            file_size,
            True
            )

        cur.execute(insert_query, params)
        conn.commit()

    # Return relevant info for new file
    return id_num, parent_id

def create_directory(virtual_file_path: FilePath) -> list[str]:
    """Creates a local copy of the file. Returns id and parent_id."""

    # Is this a valid path? (do parents exist and does child already exist)?
    parent_id = valid_new_filepath(virtual_file_path, False)
    if parent_id == "-1":
        return "",""

    # Generate a unique filename for the uploaded file
    id_num = str(uuid.uuid4())

    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()

        insert_query = """INSERT INTO filesystem
                        (id, name, extension, parent_id, file_size, is_file)
                        VALUES (?, ?, ?, ?, ?, ?)"""

        params = (
            id_num,                   # Auto generated id number of directory
            virtual_file_path.name,   # What is the name of the new directory
            "",                       # extension (always "" for directory)
            parent_id,                # id of parent directory
            0,                        # Initialize Directory of size 0
            False                     # Is NOT a file
            )

        cur.execute(insert_query, params)
        conn.commit()
    return id_num, parent_id
