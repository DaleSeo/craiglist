"use strict";
require('es6-promise').polyfill();
require('isomorphic-fetch');
const cheerio = require('cheerio');

const BASE_URL = "http://seoul.craigslist.co.kr";
const SEARCH_PATH = "/search/"

class CraigSearch {
  constructor(path) {
    this.path = path;
    this.list = [];
    this.loading = Promise.resolve();
  }
  loadList(page) {
    return this.loading = fetch(`${BASE_URL}${SEARCH_PATH}${this.path}`)
      .then(res => res.text())
      .then(html => {
        const $ = cheerio.load(html);
        const items = $('#sortable-results .row').map((i, ele) => {
          // console.log(ele);
          const timestamp = $(ele).find('time').attr('datetime');
          const title = $(ele).find('a.hdrlnk').text();
          const url = $(ele).find('a.hdrlnk').attr('href');
          return {
            title,
            url,
            timestamp
          }
        }).toArray();
        return Promise.all(items.map(o => {
          return fetch(`${BASE_URL}${o.url}`)
            .then(res => res.text())
            .then(html => {
              o.html = html;
              return o;
            })
        }));
      })
      .catch(err => console.error(err));
  }
}

const edu = new CraigSearch('edu');
edu.loadList().then(console.log.bind(console));
edu.loadList().then((x) => console.log(x));
