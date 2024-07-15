document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const bookList = document.querySelector('#book-list ul');
    const searchInput = document.querySelector('#search');
    const searchIcon = document.querySelector('#search-icon');
    const filterGenre = new Choices('#filter-genre', { removeItemButton: true, maxItemCount: 10 });
    const filterAuthor = document.querySelector('#filter-author');
    const filterRating = document.querySelector('#filter-rating');
    const genreSelect = new Choices('#genres', { removeItemButton: true, maxItemCount: 10 });
    const books = JSON.parse(localStorage.getItem('books')) || [];

    const addBookToDOM = (book, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Genre:</strong> ${book.genres.join(', ')}</p>
            <p class="rating"><strong>Rating:</strong> ${'★'.repeat(book.rating)}</p>
            <p><strong>Description:</strong> ${book.description}</p>
            <p><strong>Review/Notes:</strong> ${book.review}</p>
            <p class="date"><strong>Date Added:</strong> ${book.date}</p>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        bookList.appendChild(li);
    };

    const saveBooksToLocalStorage = () => {
        localStorage.setItem('books', JSON.stringify(books));
    };

    const updateFilters = () => {
        const genres = [...new Set(books.flatMap(book => book.genres))];
        const authors = [...new Set(books.map(book => book.author))];

        filterGenre.clearChoices();
        filterGenre.setChoices([
            { value: '', label: 'All', selected: true },
            ...genres.map(genre => ({ value: genre, label: genre }))
        ], 'value', 'label', true);

        filterAuthor.innerHTML = '<option value="">All</option>' + authors.map(author => `<option value="${author}">${author}</option>`).join('');
    };

    const renderBooks = (filter = '') => {
        bookList.innerHTML = '';
        const filteredBooks = books.filter(book => 
            (book.title.toLowerCase().includes(filter.toLowerCase()) ||
            book.author.toLowerCase().includes(filter.toLowerCase())) &&
            (filterGenre.getValue(true).length === 0 || filterGenre.getValue(true).every(value => book.genres.includes(value))) &&
            (filterAuthor.value === '' || book.author === filterAuthor.value) &&
            (filterRating.value === '' || book.rating.toString() === filterRating.value)
        );
        filteredBooks.forEach(addBookToDOM);
    };

    renderBooks();
    updateFilters();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.querySelector('#title').value;
        const author = document.querySelector('#author').value;
        const genres = genreSelect.getValue(true);
        const rating = document.querySelector('#rating').value;
        const description = document.querySelector('#description').value;
        const review = document.querySelector('#review').value;
        const date = new Date().toLocaleDateString();

        const newBook = { title, author, genres, rating, description, review, date };
        books.push(newBook);
        saveBooksToLocalStorage();
        renderBooks();
        updateFilters();

        form.reset();
        genreSelect.clearStore();
    });

    searchInput.addEventListener('input', (e) => {
        renderBooks(e.target.value);
    });

    searchIcon.addEventListener('click', () => {
        const header = document.querySelector('header');
        header.classList.toggle('active');
    });

    filterGenre.passedElement.element.addEventListener('change', () => {
        renderBooks(searchInput.value);
    });

    filterAuthor.addEventListener('change', () => {
        renderBooks(searchInput.value);
    });

    filterRating.addEventListener('change', () => {
        renderBooks(searchInput.value);
    });

    bookList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            const confirmed = confirm("Are you sure you want to delete this book?");
            if (confirmed) {
                books.splice(index, 1);
                saveBooksToLocalStorage();
                renderBooks();
                updateFilters();
            }
        }
    });
});
