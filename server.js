const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "books.json");
const initialBooks = [
    {
        id: 1,
        title: "The Shining",
        author: "Stephen King",
        category: "Horror"
    },
    {
        id: 2,
        title: "White Nights",
        author: "Fyodor Dostoevsky",
        category: "Fiction"
    },
    {
        id: 3,
        title: "And Then There Were None",
        author: "Agatha Christie",
        category: "Mystery"
    }
];
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(initialBooks, null, 4)
    );
}
function getBooks() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function saveBooks(books) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(books, null, 4)
    );
}
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(data));
}
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}
const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });
        res.end();
        return;
    }
    const url = new URL(req.url, "http://localhost:3000");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "books" || parts.length > 2) {
        sendResponse(res, 404, {
            message: "API route not found"
        });
        return;
    }
    try {
       let books = getBooks();
        if (req.method === "GET" && parts.length === 1) {
            sendResponse(res, 200, books);
        }
        else if (req.method === "GET" && parts.length === 2) {
            const id = Number(parts[1]);
            const book = books.find(b => b.id === id);
            if (!book) {
                sendResponse(res, 404, {
                    message: "Book not found"
                });
                return;
            }
            sendResponse(res, 200, book);
        }
        else if (req.method === "POST" && parts.length === 1) {
            const body = await getRequestBody(req);
            if (
                !body.title?.trim() ||
                !body.author?.trim() ||
                !body.category?.trim()
            ) {
                sendResponse(res, 400, {
                    message: "Title, author and category are required"
                });
                return;
            }
            const newBook = {
                id: books.length > 0
                    ? Math.max(...books.map(b => b.id)) + 1
                    : 1,
                title: body.title.trim(),
                author: body.author.trim(),
                category: body.category.trim()
            };
            books.push(newBook);
            saveBooks(books);
            sendResponse(res, 201, {
                message: "Book added successfully",
                book: newBook
            });
        }
        else if (req.method === "PUT" && parts.length === 2) {
            const id = Number(parts[1]);
            const index = books.findIndex(b => b.id === id);
            if (!Number.isInteger(id) || index === -1) {
                sendResponse(res, 404, {
                    message: "Book not found"
                });
                return;
            }
            const body = await getRequestBody(req);
            const title = body.title ?? books[index].title;
            const author = body.author ?? books[index].author;
            const category = body.category ?? books[index].category;
            if (
                typeof title !== "string" || !title.trim() ||
                typeof author !== "string" || !author.trim() ||
                typeof category !== "string" || !category.trim()
            ) {
                sendResponse(res, 400, {
                    message: "Valid title, author and category are required"
                });
                return;
            }
            books[index] = {
                id: id,
                title: title.trim(),
                author: author.trim(),
                category: category.trim()
            };
            saveBooks(books);
            sendResponse(res, 200, {
                message: "Book updated successfully",
                book: books[index]
            });
        }
        else if (req.method === "DELETE" && parts.length === 2) {
            const id = Number(parts[1]);
            const book = books.find(b => b.id === id);
            if (!Number.isInteger(id) || !book) {
                sendResponse(res, 404, {
                    message: "Book not found"
                });
                return;
            }
            books = books.filter(b => b.id !== id);
            saveBooks(books);
            sendResponse(res, 200, {
                message: "Book deleted successfully",
                book: book
            });
        }
        else {
            sendResponse(res, 405, {
                message: "Method not allowed"
            });
        }
    } catch (error) {
        sendResponse(res, 400, {
            message: "Invalid request or server error"
        });
    }
});
server.listen(PORT, () => {
    console.log(`Library API running at http://localhost:${PORT}`);
});
