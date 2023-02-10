import * as dotenv from 'dotenv'
import * as cheerio from 'cheerio';
import request from 'request-promise';
import client from "./db/client.js";
import fs from 'fs-extra';

dotenv.config();

const writeStream = fs.createWriteStream('categories.csv', { encoding: 'utf8' });

const $ = await request({
    uri: process.env.URL_SCRAPPING,
    transform: body => cheerio.load(body)
});

const categories = Array.from($('.item-single__content > p a[href^="#"]')).map((el) => {
    const section = $(el).attr('href');
    const parent = $(`a${section}`).parent();

    return {
        name: $(el).text(),
        children: findCategories(parent.next())
    }
});


function findCategories(ul) {
    const categories = [];

    const $ul = $(ul);

    $ul.find('> li').each((i, li) => {
        const $li = $(li);
        const $ul = $li.find('> ul');

        let name = $li.find('> span')?.text();
        name = name.length === 0 ? $li.text() : name;

        categories.push({
            name: name.trim(),
            children: $ul ? findCategories($ul) : [],
        })
    });

    return categories;
}


// console.log(JSON.stringify(categories, null, 2))


writeStream.write('Id,Name,ParentId,Path,Keywords\n');

const allCategoriesPromises = categories.map(async (category) => insertCategories(category).then(console.log))

Promise.allSettled(allCategoriesPromises).then(console.log)


async function addCategory({ name, parentId, path, keyWords }) {
    const id = generateHashId('gca')
    try {

        const _parentId = parentId === null ? null : `'${parentId}'`;
        const _path = path === null ? null : `'${path}'`;

        await client.query(`INSERT INTO gcategory ("id", "name", "parent_id", "path", "keyword") VALUES ('${id}', '${name}', ${_parentId}, ${_path}, '${keyWords}')`)

        writeStream.write(`"${id}","${name}","${parentId}","${path}","${keyWords}"\n`);
        return  id
    } catch (e) {
        console.error(e)

        return addCategory({name, parentId, path, keyWords})
    }
}

async function insertCategories(category, parentId= null, path = null, keyWords = '') {

    const  _path = path ? `${path},${parentId}` : parentId;
    const  _keyWords = keyWords ? `${keyWords.toLowerCase().trim()} ${category.name.toLowerCase().trim()}` :  category.name.toLowerCase().trim();

    const id = await addCategory({
        name: category.name,
        parentId,
        path: _path,
        keyWords: _keyWords
    })

    if (!category.children.length) {
        return id
    }

    const promises = category.children.map((child) => {
        console.log(arguments);

        return insertCategories(child, id, _path, _keyWords);
    });

    return Promise.allSettled(promises)
}


function generateHashId(prefix, length = 8) {
    let $hash = '';

    const characters = '0q1w9e2r8t3u7p4a6s5d5f6h4k7z3x8c2v9b1n0m';

    const charactersLength = (characters.length - 1);

    let counter = 0;

    while (counter < length) {
        $hash += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    return `${prefix}_${$hash}`;
}
