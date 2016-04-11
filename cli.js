#!/usr/bin/env node
var path = require('path'),
    fs = require('fs');

var argv = require('yargs')
    .usage('Usage: $0 --in [books.json] --out [books-processed.json]')
    .default('SEARCH_URL', defaultSearchUrl())
    .default('STANDORT_URL', defaultStandortUrl())
    .default('in', path.join(__dirname, 'books.json'))
    .default('out', 'books-processed.json')
    .argv;

var crawler = require('./book-data-crawler.js');
var books = require(path.isAbsolute(argv.in) ? argv.in : path.join(__dirname, argv.in));

crawler
    .getBookData(books, argv.SEARCH_URL, argv.STANDORT_URL)
    .then(function(bookData) {
        writeJSONFile(argv.out, bookData);
        writeJSONFile('report/books.json', bookData);
    });

function defaultSearchUrl() {
    return 'https://hds.hebis.de/ulbda/Search/Results?join=AND&bool0%5B%5D=AND&lookfor0%5B%5D=&type0%5B%5D=allfields&lookfor0%5B%5D=%TITLE%&type0%5B%5D=title&lookfor0%5B%5D=&type0%5B%5D=fulltitle&lookfor0%5B%5D=%AUTHOR%&type0%5B%5D=author&lookfor0%5B%5D=&type0%5B%5D=topic&lookfor0%5B%5D=&type0%5B%5D=publisher&lookfor0%5B%5D=&type0%5B%5D=misc&lookfor0%5B%5D=&type0%5B%5D=shelfmark&lookfor0%5B%5D=&type0%5B%5D=isn&trackSearchEvent=Erweiterte+Suche&submit=Suchen&filter%5B%5D=department_8%3A8%2F000&filter%5B%5D=material_brief%3ABuch&filter%5B%5D=material_access%3Aphysical&daterange%5B%5D=publish_date&publish_datefrom=&publish_dateto=';
}

function defaultStandortUrl() {
    return 'https://hds.hebis.de/ulbda/AJAX/RecordTabsDisplay?id=%ID%&tab=Holdings&_=1460376312072';
}

function writeJSONFile(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data, null, "\t"), {
        encoding: 'utf-8'
    });
}