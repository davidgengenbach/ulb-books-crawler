var R = require('ramda');
var rp = require('request-promise');
var cheerio = require('cheerio');
var Bluebird = require('bluebird');

module.exports.getBookData = getBookData;

var SEARCH_URL,
    STANDORT_URL;

function getBookData(books_, SEARCH_URL_, STANDORT_URL_) {
    var books = R.clone(books_);
    // TODO
    SEARCH_URL = SEARCH_URL_;
    STANDORT_URL = STANDORT_URL_;
    return Bluebird
        .all(R.map(function(course) {
            return Bluebird.all(R.map(processBook, course.books));
        }, books))
        .then(function() {
            return books;
        });
}


function processBook(book) {
    book.searchUrl = getSearchUrl(book.author, book.title);
    return getCandidates(book)
        .then(R.map(getCandidateData))
        .all();
}

function getSearchUrl(author, title) {
    if (!author || !title) console.error(author, title);
    return SEARCH_URL.replace(/%AUTHOR%/g, encodeURIComponent(author)).replace(/%TITLE%/g, encodeURIComponent(title));
}

function getCandidates(book) {
    return rp(book.searchUrl)
        .then(function(res) {
            var $html = cheerio.load(res);
            book.candidates = $html('.result .resultItemLine1 a').map(function() {
                var $item = $html(this),
                    url = $item.attr('href');

                return {
                    title: sanitize($item.text()),
                    url: url,
                    id: R.last(url.split('/')),
                    details: sanitize($item.parent().parent().find('.resultItemLine2').text())
                };
            }).toArray();
            return book.candidates;
        })
        .catch(function(e) {
            console.error('Error getting candidates:', e);
        });
}

// TODO: what the...
function getCandidateData(candidate) {
    candidate.standortUrl = STANDORT_URL.replace('%ID%', candidate.id);
    return rp(candidate.standortUrl)
        .then(function(html) {
            var $ = cheerio.load(html);
            candidate.standorte = $('.standort').map(function() {
                var $standort = $(this),
                    examplare = $standort.find('table.exemplartable').map(function() {
                        var $exemplar = $(this),
                            $details = $exemplar.find('tr');
                        var result = {};

                        $details.each(function() {
                            var title = $(this).find('th').text().replace(':', ''),
                                val = $(this).find('td').text();

                            result[title] = val;
                        });

                        return result;
                    }).toArray();

                return {
                    title: $standort.find('h3').text(),
                    examplare: examplare
                };
            }).toArray();
        })
        .catch(function(e) {
            console.error('Error getting examplare:', e);
        });
}

function sanitize(target) {
    return R.trim(target.replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, ' '));
}
