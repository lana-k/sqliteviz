# Sharing

You can generate a share link. That allows to share not only inquiries but also
a database and inquiry display settings. Sqliteviz will automatically load 
database and inquiries, open them and run the query for the first inquiry.

The share link can have the following query parameters:

| Parameter    | Values                           | Description |
|--------------|----------------------------------|-------------|
| `data_url`   |                                  | A URL to an SQLite database file. If not provided sqliteviz will run inquiries agains an empty database.|
| `data_format`|`sqlite`                          | Currently share links support only "sqlite" data format.
| `inquiry_url`|                                  | A URL to an inquiry JSON file (you can make that file with inquiry export – see [Manage inquiries][3]).|
| `inquiry_id` |                                  | If `inquiry_id` is provided (can occure multiple times) sqliteviz will load only inquiries with provided IDs. If not provided it will get them all.|
| `maximize`   | `table`, `sqlEditor`, `dataView` | Specify which panel should be maximised for each inquiry. If not provided the inquiries will be opened in the default state: SQL editor on top and result set at the bottom.|

> **Note:** the server where you host your database or inquiry files must allow 
cross-origin access. For example you can place your files on [GitHub Gist][1]. 
You can check your URLs with [CORS tester][2].

Use the following form to generate a share link:

[1]: https://gist.github.com/
[2]: https://cors-test.codehappy.dev/?origin=https%3A%2F%2Fsqliteviz.com%2F&method=get
[3]: ../Manage-inquiries