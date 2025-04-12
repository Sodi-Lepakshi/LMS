const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const loading = document.getElementById('loading');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');


function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function createBookCard(book) {
    return `
        <div class="col-md-6 col-lg-4">
            <div class="book-item">
                <img src="${book.imageLink}" alt="${book.title}">
                <div class="book-details">
                    <h5 class="book-title">${book.title}</h5>
                    <p class="book-author">Author: ${book.author}</p>
                    <button class="btn btn-sm btn-outline-primary add-to-favorites" 
                            data-title="${book.title}" 
                            data-author="${book.author}"
                            data-image="${book.imageLink}">
                        <i class="fas fa-heart"></i> Add to Favorites
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function searchBooks(query) {
    loading.classList.remove('hidden');
    searchResults.innerHTML = '';

    try {
        const response = await fetch(`https://apis.ccbp.in/book-store?title=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.search_results.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No results found for "' + query + '"</p>';
        } else {
            data.search_results.forEach(book => {
                searchResults.innerHTML += createBookCard(book);
            });
            
            document.querySelectorAll('.add-to-favorites').forEach(button => {
                button.addEventListener('click', function() {
                    const bookData = {
                        title: this.dataset.title,
                        author: this.dataset.author,
                        image: this.dataset.image
                    };
                    saveFavorite(bookData);
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-heart"></i> Added!';
                });
            });
        }
    } catch (error) {
        searchResults.innerHTML = '<p class="no-results">Error fetching data. Please try again later.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}


function saveFavorite(book) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.some(fav => fav.title === book.title)) {
        favorites.push(book);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

searchInput.addEventListener('keydown', debounce(function (event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) searchBooks(query);
        else searchResults.innerHTML = '<p class="no-results">Please enter a book title</p>';
    }
}, 300));

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) searchBooks(query);
    else searchResults.innerHTML = '<p class="no-results">Please enter a book title</p>';
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.innerHTML = '';
    loading.classList.add('hidden');
});