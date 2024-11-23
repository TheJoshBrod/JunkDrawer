"""File path object."""

class FilePath:
    """Object to interact with file path strings."""
    def __init__(self, path: str):
        """Constructs a filepath object"""
        self.path_list = path.split("/")[1:]
        file_name = self.path_list[-1]

        self.name = file_name
        self.extension = ""
        if "." in file_name:
            self.extension = ".".join(file_name.split(".")[1:])

        self.path = "/".join(self.path_list[:-1]) + "/"


    def __getitem__(self, index):
        """Indexes into path list."""
        return self.path_list[index]


    def __len__(self):
        """Returns length of path list."""
        return len(self.path_list)
