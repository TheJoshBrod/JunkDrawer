"""Helper Functions for filesystem.py."""
import sqlite3
import os
import uuid
import math
import regex as re
from pathlib import Path
from markupsafe import escape
from filepath import FilePath

# ***************************************************************
# Update Database
# ***************************************************************

def update_access_time(file_id: str):
    """Changes the access time of a file to be the present."""
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()
        update_query = "UPDATE filesystem SET accessed_at = CURRENT_TIMESTAMP WHERE id = ?"
        cur.execute(update_query, (file_id,))
        conn.commit()

def create_new_fileobject(id_num, virtual_file_name,
                          extension, parent_id, file_size, is_file) -> bool:
    """Creates a new fileobject entry."""
    
    # Enter Entry into the DB for the new fileobject
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()

        insert_query = """INSERT INTO filesystem
                        (id, name, extension, parent_id, file_size, is_file)
                        VALUES (?, ?, ?, ?, ?, ?)"""

        params = (
            id_num,
            virtual_file_name,
            extension,
            parent_id,
            file_size,
            is_file
            )

        cur.execute(insert_query, params)
        conn.commit()
    print("Created new file")
def delete_fileobject(id_num, virtual_file_name, parent_id, is_file=True) -> bool:
    """Deletes a fileobject entry."""

    # Remove Entry from the DB for the existing fileobject
    with sqlite3.connect('sql_db/file_system_manager.db') as conn:
        cur = conn.cursor()

        deletion_query = """DELETE FROM filesystem
                        WHERE id = ? AND name = ? AND parent_id = ? AND is_file = ?
                        """

        params = (
            id_num,
            virtual_file_name,
            parent_id,
            is_file
            )

        # Executes deletion
        cur.execute(deletion_query, params)

        # Checks how many rows were removed
        cur.execute("SELECT changes()")
        rows_modified = cur.fetchall()[0][0]

        conn.commit()

    return rows_modified == 1

# ***************************************************************
# Select from/Format data from Database
# ***************************************************************

def create_child(result: list) -> dict:
    """Extracts child information into dictionary."""
    extension = result[0]
    name = result[1]

    is_file = result[3]

    file_sizes = ["B", "KB", "MB", "GB", "TB"]
    size = result[2]
    if is_file and size != 0:
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

def find_parent_id(fileobject: FilePath, checking_for_file: bool = True) -> str:
    """ 
        Desc:
        Given Filepath, find the parent_id of lowest child of file/dir 
        
        Returns:
        - parent_id: filepath DOES exist but child does NOT.
        - "-1": filepath does NOT exist or last child DOES exists.
    """

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

# ***************************************************************
# Does it exist in the Database?
# ***************************************************************

def file_id_exists(file_id: str) -> bool:
    """Takes in file uuid string and returns if file exists in file system"""
    file_id = escape(file_id)

    file_path = Path(f'uploads/{file_id}')
    if os.path.exists(file_path):
        print(f"The file {file_path} exists.")

    return True

# ***************************************************************
# FUNCTIONS TO HANDLE CREATION OF NEW FILES AND DIRECTORIES
# ***************************************************************

def create_file(file_content, virtual_file_path: FilePath, file_size: int) -> str:
    """Creates a local copy of the file and entry into filesystem. Returns id and parent_id."""

    # If file/dir already exists returns "-1"?
    parent_id = find_parent_id(virtual_file_path)
    if parent_id == "-1":
        return "",""

    # Generate a unique filename for the uploaded file
    id_num = str(uuid.uuid4())
    filename = f"{id_num}"
    physical_filepath = os.path.join('uploads', filename)

    # Save file to file system
    try:
        file_content.save(physical_filepath)
        create_new_fileobject(id_num, virtual_file_path.name,
                              virtual_file_path.extension, parent_id, file_size, True)
    except:
        return "",""


    # Return relevant info for new file
    return id_num, parent_id

def create_default_file(file_content: bytes, parent_id: str,
                        file_size: int, virtual_file_name = "") -> str:
    """Create file entering it into filesystem. Returns id and parent_id."""

    # Get all names of children
    children = get_list_of_children(parent_id)
    # Extracts chuldrens name into a list
    children_names = [child["name"] for child in children if child["is_file"] == True]

    # Extract file name and extension
    if "." in virtual_file_name:
        file_name, extension = virtual_file_name.rsplit(".", 1)
        extension = "." + extension  # Add the dot back for the extension
    else:
        file_name = virtual_file_name
        extension = ""

    # Handle case when the file name is empty
    if not file_name:
        file_name = "new_file"

    file_name_ext = file_name + extension

    # If the file name exists in children, find an available name by incrementing counter
    if file_name_ext in children_names:
        counter = 0
        while True:
            new_file_name_ext = f"{file_name} - copy({counter}){extension}"
            if new_file_name_ext not in children_names:
                break
            counter += 1
        virtual_file_name = new_file_name_ext

    # Generate a unique filename for the uploaded file
    id_num = str(uuid.uuid4())
    filename = f"{id_num}"
    physical_filepath = os.path.join('uploads', filename)

    # Save file to file system
    try:
        file_content.save(physical_filepath)
        create_new_fileobject(id_num, virtual_file_name, extension, parent_id, file_size, True)
    except:
        return "",""

    # Return relevant info for new file
    return id_num, parent_id

def create_default_directory(parent_id: str, virtual_directory_name = "New Directory") -> str:
    """Create file entering it into filesystem. Returns id and parent_id."""

    # Get all names of children
    children = get_list_of_children(parent_id)
    # Extracts chu\ildrens name into a list
    children_names = [child["name"] for child in children if child["is_file"] == False]


    # If the file name exists in children, find an available name by incrementing counter
    if virtual_directory_name in children_names:
        counter = 0
        while True:
            new_file_name_ext = f"{virtual_directory_name} - copy({counter})"
            if new_file_name_ext not in children_names:
                break
            counter += 1
        virtual_directory_name = new_file_name_ext

    # Generate a unique filename for the uploaded file
    id_num = str(uuid.uuid4())
    
    # Create database entry
    create_new_fileobject(id_num, virtual_directory_name, "", parent_id, 0, False)
  
    # Return relevant info for new file
    return id_num, parent_id

def create_directory(virtual_file_path: FilePath) -> list[str]:
    """Creates a new directory. Returns id and parent_id."""

    # Is this a valid path? (do parents exist and does child already exist)?
    parent_id = find_parent_id(virtual_file_path, False)
    if parent_id == "-1":
        return "",""

    # Generate a unique filename for the uploaded file
    id_num = str(uuid.uuid4())
    create_new_fileobject(id_num, virtual_file_path.name, "", parent_id, 0, False)

    return id_num, parent_id

# ***************************************************************
# FUNCTIONS TO HANDLE DELETION OF NEW FILES AND DIRECTORIES
# ***************************************************************

def remove_file(parent_id: str, child_id: str, filename: str):
    """Removes file from database"""

    success = delete_fileobject(child_id, filename, parent_id)
    if success:
        os.remove(f"uploads/{child_id}")
    return success
