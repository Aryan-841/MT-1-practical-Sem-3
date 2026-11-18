const defaultBooks = [
    {
        id: 1,
        title: "The Shining",
        author: "Stephen King",
        isbn: "101",
        status: "Available"
    },
    {
        id: 2,
        title: "White Nights",
        author: "Fyodor Dostoevsky",
        isbn: "102",
        status: "Available"
    },
    {
        id: 3,
        title: "And Then There Were None",
        author: "Agatha Christie",
        isbn: "103",
        status: "Issued"
    }
];
let books = JSON.parse(localStorage.getItem("books")) || defaultBooks;
const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const search = document.getElementById("search");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const isbnInput = document.getElementById("isbn");
const statusInput = document.getElementById("status");
const editId = document.getElementById("editId");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formHeading = document.getElementById("formHeading");
function saveBooks() {
    localStorage.setItem("books", JSON.stringify(books));
}
function displayBooks(bookData = books) {
    bookList.innerHTML = "";
    document.getElementById("emptyMessage").hidden =
        bookData.length !== 0;
    bookData.forEach(book => {
        const row = document.createElement("tr");
        const titleCell = document.createElement("td");
        titleCell.textContent = book.title;
        const authorCell = document.createElement("td");
        authorCell.textContent = book.author;
        const isbnCell = document.createElement("td");
        isbnCell.textContent = book.isbn;
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = "status " +
            (book.status === "Available" ? "available" : "issued");
        statusBadge.textContent = book.status;
        statusCell.appendChild(statusBadge);
        const actionCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", function() {
            editBook(book.id);
        });
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", function() {
            deleteBook(book.id);
        });
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(titleCell);
        row.appendChild(authorCell);
        row.appendChild(isbnCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);
        bookList.appendChild(row);
    });
    updateDashboard();
}
bookForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const isbn = isbnInput.value.trim();
    const status = statusInput.value;
    if (!title || !author || !isbn) {
        alert("Please fill all fields!");
        return;
    }
    const currentId = Number(editId.value);
    const duplicate = books.some(book =>
        book.isbn === isbn && book.id !== currentId
    );
    if (duplicate) {
        alert("This ISBN already exists!");
        return;
    }
    if (currentId) {
        books = books.map(book =>
            book.id === currentId
                ? { ...book, title, author, isbn, status }
                : book
        );
        alert("Book updated successfully!");
    } else {
        const newBook = {
            id: Date.now(),
            title: title,
            author: author,
            isbn: isbn,
            status: status
        };
        books.push(newBook);
        alert("Book added successfully!");
    }
    saveBooks();
    displayBooks();
    resetForm();
});
function editBook(id) {
    const book = books.find(book => book.id === id);
    if (!book) return;
    titleInput.value = book.title;
    authorInput.value = book.author;
    isbnInput.value = book.isbn;
    statusInput.value = book.status;
    editId.value = book.id;
    formHeading.textContent = "Update Book";
    submitBtn.textContent = "Update Book";
    cancelBtn.hidden = false;
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
function deleteBook(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this book?"
    );
    if (confirmDelete) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        displayBooks();
        if (Number(editId.value) === id) {
            resetForm();
        }
        alert("Book deleted successfully!");
    }
}
function resetForm() {
    bookForm.reset();
    editId.value = "";
    formHeading.textContent = "Add New Book";
    submitBtn.textContent = "Add Book";
    cancelBtn.hidden = true;
}
cancelBtn.addEventListener("click", resetForm);
search.addEventListener("input", function() {
    const value = search.value.toLowerCase();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(value) ||
        book.author.toLowerCase().includes(value) ||
        book.isbn.toLowerCase().includes(value)
    );
    displayBooks(filteredBooks);
});
function updateDashboard() {
    document.getElementById("totalBooks").textContent =
        books.length;
    document.getElementById("availableBooks").textContent =
        books.filter(book => book.status === "Available").length;
    document.getElementById("issuedBooks").textContent =
        books.filter(book => book.status === "Issued").length;
}
displayBooks();
