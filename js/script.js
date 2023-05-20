const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_SHELF";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function createBookElement(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(id);
    });
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });
    container.append(checkButton, trashButton);
  }
  return container;
}

function addBook() {
  const titleBook = document.getElementById("title").value;
  const authorBook = document.getElementById("author").value;
  const yearBook = document.getElementById("year").value;
  const completeBook = document.getElementById("isComplete").checked;
  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    titleBook,
    authorBook,
    yearBook,
    completeBook,
    false
  );
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  document.getElementById("form").reset();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  swal({
    title: "Apakah Anda yakin?",
    text: "Buku akan ditandai sebagai selesai!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((asDone) => {
    if (asDone) {
      bookTarget.isCompleted = true;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      swal("Buku telah selesai!", {
        icon: "success",
        buttons: false,
        timer: 1500,
      });
    } else {
      swal("Buku batal ditandai sebagai selesai!", {
        icon: "info",
        buttons: false,
        timer: 1500,
      });
    }
  });
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  swal({
    title: "Apakah Anda yakin?",
    text: "Anda tidak akan dapat mengembalikan buku yang dihapus!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      swal("Buku telah dihapus!", {
        icon: "success",
        buttons: false,
        timer: 1500,
      });
    } else {
      swal("Buku batal dihapus", {
        icon: "info",
        buttons: false,
        timer: 1500,
      });
    }
  });
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  swal({
    title: "Apakah Anda yakin?",
    text: "Buku akan ditandai sebagai tidak selesai!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((notDone) => {
    if (notDone) {
      bookTarget.isCompleted = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      swal("Buku berhasil dipindahkan!", {
        icon: "success",
        buttons: false,
        timer: 1500,
      });
    } else {
      swal("Buku tetap ditandai sebagai selesai!", {
        icon: "info",
        buttons: false,
        timer: 1500,
      });
    }
  });
}

document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const mySearch = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    const bookList = document.querySelectorAll(".inner > h3");
    for (let books of bookList) {
      const title = books.innerText.toLowerCase();
      if (title.includes(mySearch)) {
        books.parentElement.parentElement.style.display = "block";
      } else {
        books.parentElement.parentElement.style.display = "none";
      }
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBook = document.getElementById("books");
  const completedBook = document.getElementById("completed-books");

  uncompletedBook.innerHTML = "";
  completedBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = createBookElement(bookItem);
    if (bookItem.isCompleted) {
      completedBook.append(bookElement);
    } else {
      uncompletedBook.append(bookElement);
    }
  }
});
