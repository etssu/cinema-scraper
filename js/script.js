const SOURCE_WEBSITE = "../src/website.html";

let favoriteBooks = [];

// Remove extra whitespace
function cleanText(text){
  return text.replace(/\s+/g, " ").trim();
}

async function loadHtmlJQuery(url) {
    try {
        return await $.ajax({
                url: url,
                dataType: "text"
            });
    } catch (error) {
        console.error("Nepodarilo sa nacitat stranku: ", url, error);
        return null;
    }
}

function parseHtml(html){
    return new DOMParser().parseFromString(html, "text/html");
}

function parseBooksGenres(doc) {
    const genres = [];

    $(doc).find(".nav-list").each((index, listElement) => {
        const $item = $(listElement);
        
        $item.find("li a").each((index, element) => {
            const genre = cleanText($(element).text());

            genres.push({
                genre: genre,
            });
        });
    });
    return genres;
}

function parseBooks(doc) {
    const books = [];

    $(doc).find("article.product_pod").each((index, articleElement) => {
        const $book = $(articleElement);

        books.push({
            title: cleanText($book.find("h3 a").attr("title")),
            image: cleanText($book.find(".image_container a img").attr("src")),
            rating: cleanText($book.find("p.star-rating").attr("class").split(" ")[1]),
            price: cleanText($book.find(".price_color").text()),
            availability: cleanText($book.find(".availability").text()),
        })
    });

    return books;
}

function createBookCard(book){
    const card = $("<article>").addClass("book-card card mb-3");

    $("<img>")
        .addClass("card-img-top p-3")
        .attr("src", new URL(book.image, "https://books.toscrape.com/").href)
        .attr("alt", book.title)
        .css({
            height: "220px",
            objectFit: "contain"
        })
        .appendTo(card);
     const body = $("<div>").addClass("card-body");

    $("<h5>")
        .addClass("card-title")
        .text(book.title)
        .appendTo(body);

    $("<p>").addClass("card-text").text(book.rating).appendTo(body);
    $("<p>").addClass("card-text fw-bold").text(book.price).appendTo(body);
    $("<p>").addClass("card-text").text(book.availability).appendTo(body);

    $("<button>").addClass("btn btn-outline-danger favorite-btn")
        .text("♡ Add to favorites")
        .attr("data-title", book.title)
        .appendTo(body);

    card.append(body);
    return card;
}

function renderBooks(books) {
    const container = $("#books-container");
    container.empty();

    const grid = $("<div>").addClass("row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3");

    books.forEach(book => {
        const column = $("<div>").addClass("col");
        column.append(createBookCard(book));
        grid.append(column);
    });

    container.append(grid);
}

function getTodayKey(){
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function saveCachedBooks(books) {
    const now = new Date().toISOString();

    const updatedBooks = books.map(book => ({
        ...book,
        lastUpdated: now,
    }));

    localStorage.setItem("booksStock",
        JSON.stringify({
            date: getTodayKey(),
            books: updatedBooks,
        })
    );

    return updatedBooks;
}

function loadCachedBooks(){
    const savedData = localStorage.getItem("booksStock");

    if (!savedData) return null;

    try {
        const cached =  JSON.parse(savedData);

        if (cached.date !== getTodayKey()) return null;

        return cached.books;
    } catch (error) {
        return null;
    }
}

function setupFavoriteEvents() {
    $("#books-container").on("click", ".favorite-btn", function () {
        const title = $(this).attr("data-title");

        if (!favoriteBooks.includes(title)){
            favoriteBooks.push(title);

            $(this)
                .text("♥ Added to favorites")
                .removeClass("btn-outline-danger")
                .addClass("btn-danger")
                .attr("aria-pressed", "true");
        } else {
            favoriteBooks = favoriteBooks.filter(book => book !== title);

            $(this)
                .text("♡ Add to favorites")
                .removeClass("btn-danger")
                .addClass("btn-outline-danger")
                .attr("aria-pressed", "false");
        }        
    });
}

async function main() {

    try {
        const cachedBooks = loadCachedBooks();

        let books;
        if (cachedBooks) {
            books = cachedBooks;
        } else {
            const html = await loadHtmlJQuery(SOURCE_WEBSITE);
            const sourceName = "Books Scraper";

            if (!html) {
                console.error(`Nepodarilo sa nacitat stranku ${sourceName}`);
                return;
            }

            const doc = parseHtml(html);
            const genres = parseBooksGenres(doc);
            books = parseBooks(doc);
            console.log(genres);
            console.log(books);

            books = saveCachedBooks(books);

            
            // normalization
            }
        renderBooks(books);
        setupFavoriteEvents();
    } catch (error){
        console.error("Nepodarilo sa načítať alebo spracovať menu:", error);
    }
}

main();