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
    print(name)
    file_sizes = ["B", "KB", "MB", "GB", "TB"]


    is_file = result[3]

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
        print(file_id)
        cur.execute(select_query, (file_id,))
        results = cur.fetchall()

    if len(results) == 0:
        return ""

    file_name = results[0][0]
    print(file_name)
    return file_name



def valid_new_filepath(fileobject: FilePath, checking_for_file: int = 1) -> str:
    """Checks if file path exists and file/dir exists 
        (-1: does NOT exist, parent_id: DOES exist)."""

    # Create connection to database
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()

        # Check if parent directory exists and starts at root
        parent_name = fileobject[0]
        parent_id = "0"

        find_directory_query = """SELECT is_file, id FROM filesystem
                                    WHERE name = ? AND parent_id = ?"""
        cur.execute(find_directory_query, (parent_name, parent_id))
        results = cur.fetchall()

        # Both File AND Dir do NOT exist return "Not Found"
        if len(results) == 0:
            return "0"

        # If end of path AND found correct type, return "Found"
        if len(fileobject) == 1:
            for result in results:
                if checking_for_file == result[0]:
                    return "-1"
            return parent_id

        # Parent id of existing directory
        parent_id = results[0][1]

        # Continue until last item on path
        for directory_name in fileobject[1:-1]:
            find_directory_query = """SELECT is_file, id FROM filesystem
                                        WHERE name = ? AND parent_id = ?"""
            cur.execute(find_directory_query, (directory_name, parent_id))
            results = cur.fetchall()

            # If directory does not exist, return "Not Found"
            if len(results) == 0:
                return "-1"
            # If ONLY file exists, return "Not Found"
            if len(results) == 1 and results[0][1]:
                return "-1"

            parent_id = results[0][1]

        # Retrieve last itme in path's name
        child_name = fileobject[-1]

        # Check if child exists
        find_obj_query = "SELECT is_file, id FROM filesystem WHERE name = ? AND parent_id = ?"
        cur.execute(find_obj_query, (child_name, parent_id))
        results = cur.fetchall()

        # If no results, return "Not Found"
        if len(results) == 0:
            return parent_id

        # If end of path AND found correct type, return "Found"
        for result in results:
            if checking_for_file == result[0]:
                return "-1"

        # Child does not exist, return "Not Found"
        return parent_id


def create_file(file_content, virtual_file_path: FilePath, file_size: int) -> str:
    """Creates a local copy of the file and entry into filesystem. Returns id and parent_id."""

    parent_id = valid_new_filepath(virtual_file_path)
    if parent_id == "-1":
        return "",""

    # Generate a unique filename for the uploaded file
    id_num = str(uuid.uuid4())
    filename = f"{id_num}"
    physical_filepath = os.path.join('uploads', filename)

    try:
        file_content.save(physical_filepath)
    except:
        return "",""

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
    return id_num, parent_id

def create_directory(virtual_file_path: FilePath) -> list[str]:
    """Creates a local copy of the file. Returns id and parent_id."""

    parent_id = valid_new_filepath(virtual_file_path, 0)
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
            id_num,
            virtual_file_path.name,
            "",
            parent_id,
            0,
            False
            )
        cur.execute(insert_query, params)
        conn.commit()
    return id_num, parent_id
